import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator.js';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ─── PUBLIC: Create booking from website (no auth) ───
  @Post()
  async createBooking(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  // ─── OWNER: Get all bookings for my salon ───
  @UseGuards(JwtAuthGuard)
  @Get()
  async getBookings(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.findBySalonId(user.salonId);
  }

  // ─── OWNER: Get today's bookings ───
  @UseGuards(JwtAuthGuard)
  @Get('today')
  async getTodayBookings(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.findTodayBySalonId(user.salonId);
  }

  // ─── OWNER: Update booking status ───
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, user.salonId, dto.status);
  }
}
