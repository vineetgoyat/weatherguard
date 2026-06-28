import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class User {
    name: string;
    email: string;
    avatar: string;
    provider: string;
    providerId: string;
    status: UserStatus;
    isAdmin: boolean;
    telegramChatId: string;
    city: string;
    requestMessage: string;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
}>;
