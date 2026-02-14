import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from './schemas/booking.schema.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  // ─── Public: salonId from body ───
  async createPublic(dto: CreateBookingDto): Promise<Booking> {
    return this.bookingModel.create({
      ...dto,
      status: 'pending',
    });
  }

  // ─── Owner: salonId from JWT ───
  async createByOwner(salonId: string, dto: CreateBookingDto): Promise<Booking> {
    return this.bookingModel.create({
      ...dto,
      salonId,
      status: 'pending',
    });
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

    return booking;
  }

  // ─── Delete booking (owner) ───
  async delete(bookingId: string, salonId: string): Promise<void> {
    const result = await this.bookingModel
      .deleteOne({ _id: bookingId, salonId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Booking not found');
    }
  }
}
