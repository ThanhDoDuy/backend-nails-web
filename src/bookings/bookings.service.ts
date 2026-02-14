import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from './schemas/booking.schema.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  async create(dto: CreateBookingDto): Promise<Booking> {
    return this.bookingModel.create({
      ...dto,
      status: 'pending',
    });
  }

  async findBySalonId(salonId: string): Promise<Booking[]> {
    return this.bookingModel
      .find({ salonId })
      .sort({ bookingDate: 1, bookingTime: 1 })
      .exec();
  }

  async findTodayBySalonId(salonId: string): Promise<Booking[]> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return this.bookingModel
      .find({ salonId, bookingDate: today })
      .sort({ bookingTime: 1 })
      .exec();
  }

  async updateStatus(
    bookingId: string,
    salonId: string,
    status: string,
  ): Promise<Booking> {
    const booking = await this.bookingModel
      .findOneAndUpdate(
        { _id: bookingId, salonId }, // salonId filter prevents cross-tenant access
        { status },
        { new: true },
      )
      .exec();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }
}
