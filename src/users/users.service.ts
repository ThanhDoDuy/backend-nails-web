import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async create(data: Partial<User>): Promise<User> {
    return this.userModel.create(data);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { passwordHash }).exec();
  }
}
