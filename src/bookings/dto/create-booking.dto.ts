import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  salonId: string;

  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsNotEmpty()
  @IsString()
  customerPhone: string;

  @IsNotEmpty()
  @IsString()
  bookingDate: string;

  @IsNotEmpty()
  @IsString()
  bookingTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
