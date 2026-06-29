import { OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
export declare class TelegramService implements OnModuleInit {
    private usersService;
    private bot;
    private readonly logger;
    constructor(usersService: UsersService);
    onModuleInit(): void;
    sendApprovalNotification(chatId: string, userName: string): Promise<void>;
    sendWeatherAlert(chatId: string, weather: any): Promise<void>;
    private getWeatherEmoji;
}
