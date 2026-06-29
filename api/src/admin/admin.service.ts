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

  getAllUsers() {
    return this.userModel.find().sort({ createdAt: -1 }).lean();
  }

  getPendingUsers() {
    return this.userModel.find({ status: 'pending' }).sort({ createdAt: -1 }).lean();
  }

  async approveUser(id: string) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    if (user.telegramChatId) {
      await this.telegramService.sendMessage(
        user.telegramChatId,
        '🎉 *Access Approved!*\n\nYou have been approved for WeatherGuard. You will now receive weather alerts at 8 AM and 6 PM daily.',
      );
    }
    return user;
  }

  async rejectUser(id: string) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    if (user.telegramChatId) {
      await this.telegramService.sendMessage(
        user.telegramChatId,
        '❌ *Access Rejected*\n\nUnfortunately your WeatherGuard access request was not approved. Please contact the admin for more information.',
      );
    }
    return user;
  }

  async sendAlertToUser(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (!user.telegramChatId) throw new NotFoundException('User has no Telegram linked');
    if (!user.city) throw new NotFoundException('User has no city set');

    const weather = await this.weatherService.getWeather(user.city);
    await this.telegramService.sendWeatherAlert(user.telegramChatId, user.name, weather);
    return { success: true };
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User not found');
    return;
  }
}