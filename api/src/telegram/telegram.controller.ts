import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('telegram')
@UseGuards(JwtAuthGuard)
export class TelegramController {
  @Get('link')
  getLink(@Request() req) {
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'WeatherGuardBot';
    const userId = req.user.id;
    return {
      link: `https://t.me/${botUsername}?start=${userId}`,
    };
  }
}
