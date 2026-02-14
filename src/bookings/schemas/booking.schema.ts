import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Salon', required: true, index: true })
  salonId: Types.ObjectId;

  @Prop({ required: true })
  serviceName: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerPhone: string;

  @Prop({ required: true })
  bookingDate: string;

  @Prop({ required: true })
  bookingTime: string;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: 'pending', enum: ['pending', 'confirmed', 'cancelled'] })
  status: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
