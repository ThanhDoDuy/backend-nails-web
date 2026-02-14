import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Salon } from './schemas/salon.schema.js';

@Injectable()
export class SalonsService {
  constructor(@InjectModel(Salon.name) private salonModel: Model<Salon>) {}

  async findById(id: string): Promise<Salon | null> {
    return this.salonModel.findById(id).exec();
  }

  async create(data: Partial<Salon>): Promise<Salon> {
    return this.salonModel.create(data);
  }
}
