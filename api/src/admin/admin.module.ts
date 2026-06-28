import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { TelegramModule } from '../telegram/telegram.module';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [UsersModule, TelegramModule, WeatherModule],
  controllers: [AdminController],
})
export class AdminModule {}
