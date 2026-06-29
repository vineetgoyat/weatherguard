import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { TelegramService } from '../telegram/telegram.service';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private telegramService: TelegramService,
    private weatherService: WeatherService,
  ) {}

  async getPendingUsers() {
    return this.userModel.find({ status: 'pending' }).exec();
  }

  async getAllUsers() {
    return this.userModel.find().exec();
  }

  async deleteUser(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  async approveUser(id: string) {
    const user = await this.userModel.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
    if (!user) throw new NotFoundException('User not found');
    if (user.telegramChatId) {
      await this.telegramService.sendApprovalNotification(user.telegramChatId, user.name);
    }
    return user;
  }

  async rejectUser(id: string) {
    const user = await this.userModel.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async sendAlertToUser(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (user.status !== 'approved') throw new Error('User is not approved');
    if (!user.telegramChatId) throw new Error('User has no Telegram linked');
    const weather = await this.weatherService.getWeather(user.city || 'London');
    await this.telegramService.sendWeatherAlert(user.telegramChatId, weather);
    return { success: true };
  }
}