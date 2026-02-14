import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from './schemas/service.schema.js';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<Service>,
  ) {}

  async findBySalonId(salonId: string): Promise<Service[]> {
    return this.serviceModel.find({ salonId }).exec();
  }

  async create(data: Partial<Service>): Promise<Service> {
    return this.serviceModel.create(data);
  }
}
