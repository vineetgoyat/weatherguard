import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserStatus } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOrCreate(profile: {
    name: string;
    email: string;
    avatar: string;
    provider: string;
    providerId: string;
  }): Promise<UserDocument> {
    let user = await this.userModel.findOne({ email: profile.email });
    if (!user) {
      const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
      user = new this.userModel({
        ...profile,
        isAdmin: adminEmails.includes(profile.email),
        status: adminEmails.includes(profile.email) ? UserStatus.APPROVED : UserStatus.PENDING,
      });
      await user.save();
    }
    return user;
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id);
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find({ isAdmin: false }).sort({ createdAt: -1 });
  }

  async findPending(): Promise<UserDocument[]> {
    return this.userModel.find({ status: UserStatus.PENDING, isAdmin: false }).sort({ createdAt: -1 });
  }

  async updateStatus(id: string, status: UserStatus): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, { status }, { new: true });
  }

  async updateTelegramChatId(userId: string, chatId: string): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(userId, { telegramChatId: chatId }, { new: true });
  }

  async updateCity(userId: string, city: string): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(userId, { city }, { new: true });
  }

  async updateRequestMessage(userId: string, message: string): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(userId, { requestMessage: message }, { new: true });
  }

  async findApprovedWithTelegram(): Promise<UserDocument[]> {
    return this.userModel.find({
      status: UserStatus.APPROVED,
      telegramChatId: { $exists: true, $ne: null },
    });
  }
}
