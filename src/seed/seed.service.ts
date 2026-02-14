import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SalonsService } from '../salons/salons.service.js';
import { UsersService } from '../users/users.service.js';
import { ServicesService } from '../services/services.service.js';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly salonsService: SalonsService,
    private readonly usersService: UsersService,
    private readonly servicesService: ServicesService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    // Check if seed data already exists
    const existingUser = await this.usersService.findByEmail('bella@gmail.com');
    if (existingUser) {
      this.logger.log('Seed data already exists, skipping...');
      return;
    }

    this.logger.log('Seeding database...');

    // Create salon
    const salon = await this.salonsService.create({
      name: 'Bella Nails',
      slug: 'bella-nails',
      phone: '(555) 123-4567',
      address: '123 Main St, Downtown',
    });

    // Create owner user
    const passwordHash = await bcrypt.hash('123456', 10);
    await this.usersService.create({
      salonId: salon._id,
      email: 'bella@gmail.com',
      passwordHash,
      role: 'owner',
    });

    // Create sample services
    const sampleServices = [
      { salonId: salon._id, name: 'Classic Manicure', duration: 30, price: 25 },
      { salonId: salon._id, name: 'Gel Manicure', duration: 45, price: 40 },
      { salonId: salon._id, name: 'Classic Pedicure', duration: 45, price: 35 },
      { salonId: salon._id, name: 'Gel Pedicure', duration: 60, price: 50 },
      { salonId: salon._id, name: 'Acrylic Full Set', duration: 90, price: 65 },
    ];

    for (const svc of sampleServices) {
      await this.servicesService.create(svc);
    }

    this.logger.log(`Seed complete. Salon ID: ${salon._id}`);
    this.logger.log('Login: bella@gmail.com / 123456');
  }
}
