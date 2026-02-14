import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for public websites
  app.enableCors();

  // Global validation pipe — auto-validates DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties
      transform: true, // auto-transform payloads to DTO types
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  Logger.log(`Server running on http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap();
