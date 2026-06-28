import { Controller, Get, Patch, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UsersService } from '../users/users.service';
import { UserStatus } from '../users/schemas/user.schema';
import { TelegramService } from '../telegram/telegram.service';
import { WeatherService } from '../weather/weather.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private usersService: UsersService,
    private telegramService: TelegramService,
    private weatherService: WeatherService,
  ) {}

  @Get('users')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get('users/pending')
  async getPendingUsers() {
    return this.usersService.findPending();
  }

  @Patch('users/:id/approve')
  async approveUser(@Param('id') id: string) {
    const user = await this.usersService.updateStatus(id, UserStatus.APPROVED);
    if (user.telegramChatId) {
      await this.telegramService.sendApprovalNotification(user.telegramChatId, user.name);
    }
    return user;
  }

  @Patch('users/:id/reject')
  async rejectUser(@Param('id') id: string) {
    return this.usersService.updateStatus(id, UserStatus.REJECTED);
  }

  @Post('users/:id/send-alert')
  async sendManualAlert(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user?.telegramChatId) {
      return { message: 'User has no Telegram linked' };
    }
    const city = user.city || 'London';
    const weather = await this.weatherService.getWeather(city);
    await this.telegramService.sendWeatherAlert(user.telegramChatId, weather);
    return { message: 'Alert sent!' };
  }
}
