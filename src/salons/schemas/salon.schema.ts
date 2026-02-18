import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Salon extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  /** GitHub repo name (owner/repo or just repo) for site content. Used by Content API. */
  @Prop()
  repoName?: string;

  /** Path to site config file in repo, e.g. config/site.json or data/content.json */
  @Prop({ default: 'data/content.json' })
  filePath?: string;
}

export const SalonSchema = SchemaFactory.createForClass(Salon);
