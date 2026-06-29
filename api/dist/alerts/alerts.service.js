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
var AlertsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const users_service_1 = require("../users/users.service");
const weather_service_1 = require("../weather/weather.service");
const telegram_service_1 = require("../telegram/telegram.service");
let AlertsService = AlertsService_1 = class AlertsService {
    constructor(usersService, weatherService, telegramService) {
        this.usersService = usersService;
        this.weatherService = weatherService;
        this.telegramService = telegramService;
        this.logger = new common_1.Logger(AlertsService_1.name);
    }
    async morningAlert() {
        this.logger.log('⏰ Running morning weather alerts');
        await this.sendAlertsToAll();
    }
    async eveningAlert() {
        this.logger.log('⏰ Running evening weather alerts');
        await this.sendAlertsToAll();
    }
    async sendAlertsToAll() {
        const users = await this.usersService.findApprovedWithTelegram();
        this.logger.log(`Sending alerts to ${users.length} users`);
        for (const user of users) {
            try {
                const city = user.city || 'London';
                const weather = await this.weatherService.getWeather(city);
                await this.telegramService.sendWeatherAlert(user.telegramChatId, weather);
            }
            catch (e) {
                this.logger.error(`Failed to send alert to ${user.email}:`, e.message);
            }
        }
    }
};
exports.AlertsService = AlertsService;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AlertsService.prototype, "morningAlert", null);
__decorate([
    (0, schedule_1.Cron)('0 18 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AlertsService.prototype, "eveningAlert", null);
exports.AlertsService = AlertsService = AlertsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        weather_service_1.WeatherService,
        telegram_service_1.TelegramService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map