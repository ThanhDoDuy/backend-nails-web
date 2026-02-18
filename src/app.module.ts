import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module.js';
import { SalonsModule } from './salons/salons.module.js';
import { UsersModule } from './users/users.module.js';
import { ServicesModule } from './services/services.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { SeedModule } from './seed/seed.module.js';
import { ContentModule } from './content/content.module.js';
import { UploadModule } from './upload/upload.module.js';
import { AppController } from './app.controller.js';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        MONGODB_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        SUPER_ADMIN_KEY: Joi.string().required(),
      }),
      validationOptions: {
        abortEarly: false, // show ALL missing vars, not just the first one
      },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    AuthModule,
    SalonsModule,
    UsersModule,
    ServicesModule,
    BookingsModule,
    CustomersModule,
    SeedModule,
    ContentModule,
    UploadModule,
  ],
})
export class AppModule {}
