import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ContentService } from './content.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator.js';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  async getContent(@CurrentUser() user: JwtPayload) {
    return this.contentService.getContent(user.userId, user.salonId);
  }

  @Put()
  async updateContent(
    @CurrentUser() user: JwtPayload,
    @Body() body: unknown,
  ) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Body must be a JSON object');
    }

    return this.contentService.updateContent(
      user.userId,
      user.salonId,
      body as object,
    );
  }
}
