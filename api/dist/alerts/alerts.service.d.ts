import { UsersService } from '../users/users.service';
import { WeatherService } from '../weather/weather.service';
import { TelegramService } from '../telegram/telegram.service';
export declare class AlertsService {
    private usersService;
    private weatherService;
    private telegramService;
    private readonly logger;
    constructor(usersService: UsersService, weatherService: WeatherService, telegramService: TelegramService);
    morningAlert(): Promise<void>;
    eveningAlert(): Promise<void>;
    private sendAlertsToAll;
}
