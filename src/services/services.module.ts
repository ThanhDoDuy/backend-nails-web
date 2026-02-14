import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './schemas/service.schema.js';
import { ServicesService } from './services.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
  ],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
