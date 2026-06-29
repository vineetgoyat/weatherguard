import { Model } from 'mongoose';
import { UserDocument, UserStatus } from './schemas/user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findOrCreate(profile: {
        name: string;
        email: string;
        avatar: string;
        provider: string;
        providerId: string;
    }): Promise<UserDocument>;
    findById(id: string): Promise<UserDocument>;
    findAll(): Promise<UserDocument[]>;
    findPending(): Promise<UserDocument[]>;
    updateStatus(id: string, status: UserStatus): Promise<UserDocument>;
    updateTelegramChatId(userId: string, chatId: string): Promise<UserDocument>;
    updateCity(userId: string, city: string): Promise<UserDocument>;
    updateRequestMessage(userId: string, message: string): Promise<UserDocument>;
    findApprovedWithTelegram(): Promise<UserDocument[]>;
}
