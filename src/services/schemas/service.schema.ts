import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Service extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Salon', required: true, index: true })
  salonId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  price: number;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
