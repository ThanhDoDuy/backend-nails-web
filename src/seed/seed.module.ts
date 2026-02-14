import { Module } from '@nestjs/common';
import { SeedService } from './seed.service.js';
import { SalonsModule } from '../salons/salons.module.js';
import { UsersModule } from '../users/users.module.js';
import { ServicesModule } from '../services/services.module.js';

@Module({
  imports: [SalonsModule, UsersModule, ServicesModule],
  providers: [SeedService],
})
export class SeedModule {}
