import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, LoyaltyTier } from './schemas/customer.schema.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
  ) {}

  // ─── Loyalty tier calculation ─────────────────────────────
  static calculateTier(totalVisits: number): LoyaltyTier {
    if (totalVisits >= 21) return 'platinum';
    if (totalVisits >= 11) return 'gold';
    if (totalVisits >= 6) return 'silver';
    if (totalVisits >= 3) return 'bronze';
    return 'new';
  }

  // ─── Upsert customer on booking creation ──────────────────
  // Called when a new booking is created; ensures customer record exists
  async upsertOnBooking(
    salonId: string,
    customerName: string,
    customerPhone: string,
  ): Promise<Customer> {
    const existing = await this.customerModel
      .findOne({ salonId, customerPhone })
      .exec();

    if (existing) {
      // Update name if changed (customer might give a different name)
      if (existing.customerName !== customerName) {
        existing.customerName = customerName;
        await existing.save();
      }
      return existing;
    }

    // Create new customer record
    return this.customerModel.create({
      salonId,
      customerName,
      customerPhone,
      totalVisits: 0,
      loyaltyPoints: 0,
      loyaltyTier: 'new',
    });
  }

  // ─── Record a confirmed visit ─────────────────────────────
  // Called when booking status changes to 'confirmed'
  async recordVisit(
    salonId: string,
    customerPhone: string,
    visitDate: string,
  ): Promise<Customer | null> {
    const customer = await this.customerModel
      .findOne({ salonId, customerPhone })
      .exec();

    if (!customer) return null;

    customer.totalVisits += 1;
    customer.loyaltyPoints += 10; // 10 points per visit
    customer.lastVisitDate = visitDate;
    if (!customer.firstVisitDate) {
      customer.firstVisitDate = visitDate;
    }
    customer.loyaltyTier = CustomersService.calculateTier(customer.totalVisits);

    return customer.save();
  }

  // ─── Undo a visit (when confirmed → cancelled) ───────────
  async undoVisit(
    salonId: string,
    customerPhone: string,
  ): Promise<Customer | null> {
    const customer = await this.customerModel
      .findOne({ salonId, customerPhone })
      .exec();

    if (!customer || customer.totalVisits === 0) return null;

    customer.totalVisits -= 1;
    customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints - 10);
    customer.loyaltyTier = CustomersService.calculateTier(customer.totalVisits);

    return customer.save();
  }

  // ─── List customers for a salon ───────────────────────────
  async findBySalonId(
    salonId: string,
    search?: string,
    tier?: string,
  ): Promise<Customer[]> {
    const filter: Record<string, any> = { salonId };

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { customerName: regex },
        { customerPhone: regex },
      ];
    }

    if (tier) {
      filter.loyaltyTier = tier;
    }

    return this.customerModel
      .find(filter)
      .sort({ totalVisits: -1, lastVisitDate: -1 })
      .exec();
  }

  // ─── Get single customer by ID ────────────────────────────
  async findById(customerId: string, salonId: string): Promise<Customer> {
    const customer = await this.customerModel
      .findOne({ _id: customerId, salonId })
      .exec();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  // ─── Lookup by phone ──────────────────────────────────────
  async findByPhone(salonId: string, phone: string): Promise<Customer | null> {
    return this.customerModel
      .findOne({ salonId, customerPhone: phone })
      .exec();
  }

  // ─── Update customer notes or name ────────────────────────
  async update(
    customerId: string,
    salonId: string,
    dto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.customerModel
      .findOneAndUpdate(
        { _id: customerId, salonId },
        { $set: dto },
        { returnDocument: 'after' },
      )
      .exec();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  // ─── Get loyalty stats for dashboard ──────────────────────
  async getStats(salonId: string) {
    const all = await this.customerModel.find({ salonId }).exec();
    const total = all.length;
    const tiers = { new: 0, bronze: 0, silver: 0, gold: 0, platinum: 0 };

    for (const c of all) {
      tiers[c.loyaltyTier as keyof typeof tiers] += 1;
    }

    return { total, tiers };
  }
}
