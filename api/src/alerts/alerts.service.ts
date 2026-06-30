import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from '../users/users.service';
import { WeatherService } from '../weather/weather.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private usersService: UsersService,
    private weatherService: WeatherService,
    private telegramService: TelegramService,
  ) {}

  // 8 AM daily — Asia/Kolkata
  @Cron('0 8 * * *', { timeZone: 'Asia/Kolkata' })
  async morningAlert() {
    this.logger.log('⏰ Running morning weather alerts');
    await this.sendAlertsToAll();
  }

  // 6 PM daily — Asia/Kolkata
  @Cron('0 18 * * *', { timeZone: 'Asia/Kolkata' })
  async eveningAlert() {
    this.logger.log('⏰ Running evening weather alerts');
    await this.sendAlertsToAll();
  }

  private async sendAlertsToAll() {
    const users = await this.usersService.findApprovedWithTelegram();
    this.logger.log(`Sending alerts to ${users.length} users`);
    for (const user of users) {
      try {
        const city = user.city || 'London';
        const weather = await this.weatherService.getWeather(city);
        await this.telegramService.sendWeatherAlert(user.telegramChatId, weather);
      } catch (e) {
        this.logger.error(`Failed to send alert to ${user.email}:`, e.message);
      }
    }
  }
}