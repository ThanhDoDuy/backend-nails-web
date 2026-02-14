import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { SuperAdminGuard } from '../common/guards/super-admin.guard.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Super admin: create salon + owner account
  @UseGuards(SuperAdminGuard)
  @Post('create-account')
  async createAccount(@Body() dto: CreateAccountDto) {
    return this.authService.createAccount(dto);
  }

  // Owner: change own password
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.userId, dto);
  }
}
