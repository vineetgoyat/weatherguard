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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const users_service_1 = require("../users/users.service");
const user_schema_1 = require("../users/schemas/user.schema");
const telegram_service_1 = require("../telegram/telegram.service");
const weather_service_1 = require("../weather/weather.service");
let AdminController = class AdminController {
    constructor(usersService, telegramService, weatherService) {
        this.usersService = usersService;
        this.telegramService = telegramService;
        this.weatherService = weatherService;
    }
    async getAllUsers() {
        return this.usersService.findAll();
    }
    async getPendingUsers() {
        return this.usersService.findPending();
    }
    async approveUser(id) {
        const user = await this.usersService.updateStatus(id, user_schema_1.UserStatus.APPROVED);
        if (user.telegramChatId) {
            await this.telegramService.sendApprovalNotification(user.telegramChatId, user.name);
        }
        return user;
    }
    async rejectUser(id) {
        return this.usersService.updateStatus(id, user_schema_1.UserStatus.REJECTED);
    }
    async sendManualAlert(id) {
        const user = await this.usersService.findById(id);
        if (!user?.telegramChatId) {
            return { message: 'User has no Telegram linked' };
        }
        const city = user.city || 'London';
        const weather = await this.weatherService.getWeather(city);
        await this.telegramService.sendWeatherAlert(user.telegramChatId, weather);
        return { message: 'Alert sent!' };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('users/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectUser", null);
__decorate([
    (0, common_1.Post)('users/:id/send-alert'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "sendManualAlert", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        telegram_service_1.TelegramService,
        weather_service_1.WeatherService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map