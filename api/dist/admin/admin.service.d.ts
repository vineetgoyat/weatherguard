import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { TelegramService } from '../telegram/telegram.service';
import { WeatherService } from '../weather/weather.service';
export declare class AdminService {
    private userModel;
    private telegramService;
    private weatherService;
    constructor(userModel: Model<User>, telegramService: TelegramService, weatherService: WeatherService);
    getAllUsers(): import("mongoose").Query<(import("mongoose").FlattenMaps<User> & {
        _id: import("mongoose").Types.ObjectId;
    })[], import("mongoose").Document<unknown, {}, User> & User & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, User, "find">;
    getPendingUsers(): import("mongoose").Query<(import("mongoose").FlattenMaps<User> & {
        _id: import("mongoose").Types.ObjectId;
    })[], import("mongoose").Document<unknown, {}, User> & User & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, User, "find">;
    approveUser(id: string): Promise<import("mongoose").Document<unknown, {}, User> & User & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    rejectUser(id: string): Promise<import("mongoose").Document<unknown, {}, User> & User & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    sendAlertToUser(id: string): Promise<{
        success: boolean;
    }>;
    deleteUser(id: string): Promise<void>;
}
