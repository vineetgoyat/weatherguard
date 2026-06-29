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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const telegram_service_1 = require("../telegram/telegram.service");
const weather_service_1 = require("../weather/weather.service");
let AdminService = class AdminService {
    constructor(userModel, telegramService, weatherService) {
        this.userModel = userModel;
        this.telegramService = telegramService;
        this.weatherService = weatherService;
    }
    async getPendingUsers() {
        return this.userModel.find({ status: 'pending' }).exec();
    }
    async getAllUsers() {
        return this.userModel.find().exec();
    }
    async approveUser(id) {
        const user = await this.userModel.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.telegramChatId) {
            await this.telegramService.sendApprovalNotification(user.telegramChatId, user.name);
        }
        return user;
    }
    async rejectUser(id) {
        const user = await this.userModel.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async sendAlertToUser(id) {
        const user = await this.userModel.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.status !== 'approved')
            throw new Error('User is not approved');
        if (!user.telegramChatId)
            throw new Error('User has no Telegram linked');
        const weather = await this.weatherService.getWeather(user.city || 'London');
        await this.telegramService.sendWeatherAlert(user.telegramChatId, weather);
        return { success: true };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        telegram_service_1.TelegramService,
        weather_service_1.WeatherService])
], AdminService);
//# sourceMappingURL=admin.service.js.map