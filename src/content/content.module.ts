import { Module } from '@nestjs/common';
import { ContentController } from './content.controller.js';
import { ContentService } from './content.service.js';
import { GitHubService } from './github.service.js';
import { SalonsModule } from '../salons/salons.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [SalonsModule, UsersModule],
  controllers: [ContentController],
  providers: [GitHubService, ContentService],
})
export class ContentModule {}
