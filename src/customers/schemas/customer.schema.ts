import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoyaltyTier = 'new' | 'bronze' | 'silver' | 'gold' | 'platinum';

@Schema({ timestamps: true })
export class Customer extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Salon', required: true, index: true })
  salonId: Types.ObjectId;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerPhone: string;

  @Prop({ default: 0 })
  totalVisits: number;

  @Prop({ default: 0 })
  loyaltyPoints: number;

  @Prop({ default: 'new', enum: ['new', 'bronze', 'silver', 'gold', 'platinum'] })
  loyaltyTier: LoyaltyTier;

  @Prop()
  firstVisitDate: string;

  @Prop()
  lastVisitDate: string;

  @Prop({ default: '' })
  notes: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Compound index: one customer record per phone per salon
CustomerSchema.index({ salonId: 1, customerPhone: 1 }, { unique: true });
