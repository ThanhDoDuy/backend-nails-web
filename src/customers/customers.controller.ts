import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CustomerQueryDto } from './dto/customer-query.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator.js';
import { Body } from '@nestjs/common';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // ─── List all customers (with optional search/tier filter) ─
  @Get()
  async getCustomers(
    @CurrentUser() user: JwtPayload,
    @Query() query: CustomerQueryDto,
  ) {
    return this.customersService.findBySalonId(
      user.salonId,
      query.search,
      query.tier,
    );
  }

  // ─── Loyalty stats for dashboard ──────────────────────────
  @Get('stats')
  async getStats(@CurrentUser() user: JwtPayload) {
    return this.customersService.getStats(user.salonId);
  }

  // ─── Lookup customer by phone ─────────────────────────────
  @Get('phone/:phone')
  async getByPhone(
    @CurrentUser() user: JwtPayload,
    @Param('phone') phone: string,
  ) {
    return this.customersService.findByPhone(user.salonId, phone);
  }

  // ─── Get single customer ──────────────────────────────────
  @Get(':id')
  async getCustomer(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.customersService.findById(id, user.salonId);
  }

  // ─── Update customer notes/name ───────────────────────────
  @Patch(':id')
  async updateCustomer(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, user.salonId, dto);
  }
}
