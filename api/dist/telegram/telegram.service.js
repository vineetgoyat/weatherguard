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
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const TelegramBot = require("node-telegram-bot-api");
const users_service_1 = require("../users/users.service");
let TelegramService = TelegramService_1 = class TelegramService {
    constructor(usersService) {
        this.usersService = usersService;
        this.logger = new common_1.Logger(TelegramService_1.name);
    }
    onModuleInit() {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
            this.logger.warn('TELEGRAM_BOT_TOKEN not set — bot disabled');
            return;
        }
        this.bot = new TelegramBot(token, { polling: true });
        this.bot.onText(/\/start (.+)/, async (msg, match) => {
            const chatId = msg.chat.id.toString();
            const userId = match[1];
            try {
                await this.usersService.updateTelegramChatId(userId, chatId);
                await this.bot.sendMessage(chatId, `✅ *WeatherGuard Linked!*\n\nHi ${msg.from.first_name}! Your Telegram is now connected.\n\nYou'll receive weather alerts here once an admin approves your access.`, { parse_mode: 'Markdown' });
            }
            catch (e) {
                this.logger.error('Error linking Telegram:', e);
            }
        });
        this.bot.onText(/\/start$/, async (msg) => {
            await this.bot.sendMessage(msg.chat.id, `👋 Welcome to *WeatherGuard Bot*!\n\nSign up on the web app and use your unique link to connect Telegram.`, { parse_mode: 'Markdown' });
        });
        this.logger.log('✅ Telegram bot started');
    }
    async sendApprovalNotification(chatId, userName) {
        if (!this.bot)
            return;
        await this.bot.sendMessage(chatId, `🎉 *Access Approved!*\n\nHey ${userName}, your WeatherGuard access has been approved!\n\n🌦 You'll now receive automated weather alerts twice daily (8 AM & 6 PM).`, { parse_mode: 'Markdown' });
    }
    async sendWeatherAlert(chatId, weather) {
        if (!this.bot)
            return;
        const emoji = this.getWeatherEmoji(weather.description);
        const message = `${emoji} *Weather Alert — ${weather.city}*\n\n` +
            `🌡 Temperature: *${weather.temp}°C* (feels like ${weather.feelsLike}°C)\n` +
            `☁️ Condition: *${weather.description}*\n` +
            `💧 Humidity: ${weather.humidity}%\n` +
            `💨 Wind: ${weather.windSpeed} m/s\n\n` +
            `_Updated: ${new Date().toLocaleString()}_`;
        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    }
    getWeatherEmoji(description) {
        const d = description.toLowerCase();
        if (d.includes('sun') || d.includes('clear'))
            return '☀️';
        if (d.includes('cloud'))
            return '⛅';
        if (d.includes('rain'))
            return '🌧';
        if (d.includes('snow'))
            return '❄️';
        if (d.includes('storm') || d.includes('thunder'))
            return '⛈';
        if (d.includes('fog') || d.includes('mist'))
            return '🌫';
        return '🌡';
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map