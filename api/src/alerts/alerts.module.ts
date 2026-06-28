import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { UsersModule } from '../users/users.module';
import { WeatherModule } from '../weather/weather.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [UsersModule, WeatherModule, TelegramModule],
  providers: [AlertsService],
})
export class AlertsModule {}
