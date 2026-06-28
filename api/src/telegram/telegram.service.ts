import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { UsersService } from '../users/users.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: TelegramBot;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private usersService: UsersService) {}

  onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not set — bot disabled');
      return;
    }
    this.bot = new TelegramBot(token, { polling: true });

    this.bot.onText(/\/start (.+)/, async (msg, match) => {
      const chatId = msg.chat.id.toString();
      const userId = match[1];
      try {
        await this.usersService.updateTelegramChatId(userId, chatId);
        await this.bot.sendMessage(
          chatId,
          `✅ WeatherGuard Linked!\n\nYour Telegram is now connected. You will receive weather alerts once your access is approved.`,
        );
      } catch (e) {
        this.logger.error('Error linking Telegram:', e);
      }
    });

    this.bot.onText(/\/start$/, async (msg) => {
      await this.bot.sendMessage(
        msg.chat.id,
        `👋 Welcome to WeatherGuard Bot!\n\nSign up on the web app and use your unique link to connect Telegram.`,
      );
    });

    this.logger.log('✅ Telegram bot started');
  }

  async sendApprovalNotification(chatId: string, userName: string) {
    if (!this.bot) return;
    await this.bot.sendMessage(
      chatId,
      `🎉 Access Approved!\n\nYour WeatherGuard access has been approved! You will now receive automated weather alerts twice daily at 8 AM and 6 PM.`,
    );
  }

  async sendWeatherAlert(chatId: string, weather: any) {
    if (!this.bot) return;
    const emoji = this.getWeatherEmoji(weather.description);
    const message =
      `${emoji} Weather Alert - ${weather.city}\n\n` +
      `Temperature: ${weather.temp}°C (feels like ${weather.feelsLike}°C)\n` +
      `Condition: ${weather.description}\n` +
      `Humidity: ${weather.humidity}%\n` +
      `Wind: ${weather.windSpeed} m/s\n\n` +
      `Updated: ${new Date().toLocaleString()}`;
    await this.bot.sendMessage(chatId, message);
  }

  private getWeatherEmoji(description: string): string {
    const d = description.toLowerCase();
    if (d.includes('sun') || d.includes('clear')) return '☀️';
    if (d.includes('cloud')) return '⛅';
    if (d.includes('rain')) return '🌧';
    if (d.includes('snow')) return '❄️';
    if (d.includes('storm') || d.includes('thunder')) return '⛈';
    if (d.includes('fog') || d.includes('mist')) return '🌫';
    return '🌡';
  }
}