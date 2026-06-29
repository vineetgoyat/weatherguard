import { UsersService } from '../users/users.service';
import { TelegramService } from '../telegram/telegram.service';
import { WeatherService } from '../weather/weather.service';
export declare class AdminController {
    private usersService;
    private telegramService;
    private weatherService;
    constructor(usersService: UsersService, telegramService: TelegramService, weatherService: WeatherService);
    getAllUsers(): Promise<import("../users/schemas/user.schema").UserDocument[]>;
    getPendingUsers(): Promise<import("../users/schemas/user.schema").UserDocument[]>;
    approveUser(id: string): Promise<import("../users/schemas/user.schema").UserDocument>;
    rejectUser(id: string): Promise<import("../users/schemas/user.schema").UserDocument>;
    sendManualAlert(id: string): Promise<{
        message: string;
    }>;
}
