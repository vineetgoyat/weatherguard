import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { TelegramService } from '../telegram/telegram.service';
import { WeatherService } from '../weather/weather.service';
export declare class AdminService {
    private userModel;
    private telegramService;
    private weatherService;
    constructor(userModel: Model<User>, telegramService: TelegramService, weatherService: WeatherService);
    getPendingUsers(): Promise<(import("mongoose").Document<unknown, {}, User> & User & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getAllUsers(): Promise<(import("mongoose").Document<unknown, {}, User> & User & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    approveUser(id: string): Promise<import("mongoose").Document<unknown, {}, User> & User & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    rejectUser(id: string): Promise<import("mongoose").Document<unknown, {}, User> & User & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    sendAlertToUser(id: string): Promise<{
        success: boolean;
    }>;
}
