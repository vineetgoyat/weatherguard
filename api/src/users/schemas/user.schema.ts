import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  avatar: string;

  @Prop({ required: true, enum: ['google', 'github'] })
  provider: string;

  @Prop({ required: true })
  providerId: string;

  @Prop({ default: UserStatus.PENDING, enum: UserStatus })
  status: UserStatus;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop()
  telegramChatId: string;

  @Prop()
  city: string;

  @Prop()
  requestMessage: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
