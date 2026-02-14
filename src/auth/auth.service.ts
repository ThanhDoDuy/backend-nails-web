import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { SalonsService } from '../salons/salons.service.js';
import { LoginDto } from './dto/login.dto.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly salonsService: SalonsService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      userId: user._id.toString(),
      salonId: user.salonId.toString(),
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async createAccount(dto: CreateAccountDto) {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Create salon
    const salon = await this.salonsService.create({
      name: dto.salonName,
      slug: dto.salonSlug,
      phone: dto.salonPhone,
      address: dto.salonAddress,
    });

    // Create owner
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      salonId: salon._id,
      email: dto.email,
      passwordHash,
      role: 'owner',
    });

    return {
      salonId: salon._id,
      salonName: salon.name,
      userId: user._id,
      email: user.email,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(userId, newHash);

    return { message: 'Password changed successfully' };
  }
}
