import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Salon, SalonSchema } from './schemas/salon.schema.js';
import { SalonsService } from './salons.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Salon.name, schema: SalonSchema }]),
  ],
  providers: [SalonsService],
  exports: [SalonsService],
})
export class SalonsModule {}
