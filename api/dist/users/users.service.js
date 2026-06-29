"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findOrCreate(profile) {
        let user = await this.userModel.findOne({ email: profile.email });
        if (!user) {
            const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
            user = new this.userModel({
                ...profile,
                isAdmin: adminEmails.includes(profile.email),
                status: adminEmails.includes(profile.email) ? user_schema_1.UserStatus.APPROVED : user_schema_1.UserStatus.PENDING,
            });
            await user.save();
        }
        return user;
    }
    async findById(id) {
        return this.userModel.findById(id);
    }
    async findAll() {
        return this.userModel.find({ isAdmin: false }).sort({ createdAt: -1 });
    }
    async findPending() {
        return this.userModel.find({ status: user_schema_1.UserStatus.PENDING, isAdmin: false }).sort({ createdAt: -1 });
    }
    async updateStatus(id, status) {
        return this.userModel.findByIdAndUpdate(id, { status }, { new: true });
    }
    async updateTelegramChatId(userId, chatId) {
        return this.userModel.findByIdAndUpdate(userId, { telegramChatId: chatId }, { new: true });
    }
    async updateCity(userId, city) {
        return this.userModel.findByIdAndUpdate(userId, { city }, { new: true });
    }
    async updateRequestMessage(userId, message) {
        return this.userModel.findByIdAndUpdate(userId, { requestMessage: message }, { new: true });
    }
    async findApprovedWithTelegram() {
        return this.userModel.find({
            status: user_schema_1.UserStatus.APPROVED,
            telegramChatId: { $exists: true, $ne: null },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map