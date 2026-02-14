import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { BookingQueryDto } from './dto/booking-query.dto.js';
import { DayQueryDto } from './dto/day-query.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator.js';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ─── PUBLIC: Create booking from website (salonId in body) ───
  @Post('public')
  async createPublicBooking(@Body() dto: CreateBookingDto) {
    return this.bookingsService.createPublic(dto);
  }

  // ─── OWNER: Create booking (salonId from JWT) ───
  @UseGuards(JwtAuthGuard)
  @Post()
  async createBooking(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.createByOwner(user.salonId, dto);
  }

  // ─── OWNER: Get bookings (optional date range filter) ───
  @UseGuards(JwtAuthGuard)
  @Get()
  async getBookings(
    @CurrentUser() user: JwtPayload,
    @Query() query: BookingQueryDto,
  ) {
    return this.bookingsService.findBySalonId(
      user.salonId,
      query.from,
      query.to,
    );
  }

  // ─── OWNER: Get bookings for exact day ───
  @UseGuards(JwtAuthGuard)
  @Get('day')
  async getDayBookings(
    @CurrentUser() user: JwtPayload,
    @Query() query: DayQueryDto,
  ) {
    return this.bookingsService.findByDay(user.salonId, query.day);
  }

  // ─── OWNER: Update booking status only ───
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateBookingStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, user.salonId, { status: dto.status });
  }

  // ─── OWNER: Update booking (any field) ───
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateBooking(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, user.salonId, dto);
  }

  // ─── OWNER: Delete booking ───
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteBooking(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.bookingsService.delete(id, user.salonId);
    return { message: 'Booking deleted' };
  }
}
