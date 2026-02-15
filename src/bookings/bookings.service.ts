import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from './schemas/booking.schema.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { CustomersService } from '../customers/customers.service.js';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private readonly customersService: CustomersService,
  ) {}

  // ─── Public: salonId from body ───
  async createPublic(dto: CreateBookingDto): Promise<Booking> {
    const booking = await this.bookingModel.create({
      ...dto,
      status: 'pending',
    });

    // Auto-track customer
    if (dto.salonId) {
      await this.customersService.upsertOnBooking(
        dto.salonId,
        dto.customerName,
        dto.customerPhone,
      );
    }

    return booking;
  }

  // ─── Owner: salonId from JWT ───
  async createByOwner(salonId: string, dto: CreateBookingDto): Promise<Booking> {
    const booking = await this.bookingModel.create({
      ...dto,
      salonId,
      status: 'pending',
    });

    // Auto-track customer
    await this.customersService.upsertOnBooking(
      salonId,
      dto.customerName,
      dto.customerPhone,
    );

    return booking;
  }

  // ─── List with optional date range ───
  async findBySalonId(
    salonId: string,
    from?: string,
    to?: string,
  ): Promise<Booking[]> {
    const filter: Record<string, any> = { salonId };

    if (from || to) {
      filter.bookingDate = {};
      if (from) filter.bookingDate.$gte = from;
      if (to) filter.bookingDate.$lte = to;
    }

    return this.bookingModel
      .find(filter)
      .sort({ bookingDate: 1, bookingTime: 1 })
      .exec();
  }

  // ─── Exact day ───
  async findByDay(salonId: string, day: string): Promise<Booking[]> {
    return this.bookingModel
      .find({ salonId, bookingDate: day })
      .sort({ bookingTime: 1 })
      .exec();
  }

  // ─── Update booking (owner) ───
  async update(
    bookingId: string,
    salonId: string,
    dto: UpdateBookingDto,
  ): Promise<Booking> {
    // Get current booking to detect status transitions
    const current = await this.bookingModel
      .findOne({ _id: bookingId, salonId })
      .exec();

    if (!current) {
      throw new NotFoundException('Booking not found');
    }

    const oldStatus = current.status;
    const newStatus = dto.status;

    const booking = await this.bookingModel
      .findOneAndUpdate(
        { _id: bookingId, salonId },
        { $set: dto },
        { returnDocument: 'after' },
      )
      .exec();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // ── Loyalty tracking on status change ──
    if (newStatus && newStatus !== oldStatus) {
      if (newStatus === 'confirmed' && oldStatus !== 'confirmed') {
        // New confirmed visit → record visit
        await this.customersService.recordVisit(
          salonId,
          booking.customerPhone,
          booking.bookingDate,
        );
      } else if (oldStatus === 'confirmed' && newStatus !== 'confirmed') {
        // Was confirmed, now cancelled/pending → undo visit
        await this.customersService.undoVisit(
          salonId,
          booking.customerPhone,
        );
      }
    }

    return booking;
  }

  // ─── Delete booking (owner) ───
  async delete(bookingId: string, salonId: string): Promise<void> {
    const booking = await this.bookingModel
      .findOne({ _id: bookingId, salonId })
      .exec();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // If deleting a confirmed booking, undo the visit
    if (booking.status === 'confirmed') {
      await this.customersService.undoVisit(salonId, booking.customerPhone);
    }

    await this.bookingModel.deleteOne({ _id: bookingId, salonId }).exec();
  }
}
