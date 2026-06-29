"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WeatherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let WeatherService = WeatherService_1 = class WeatherService {
    constructor() {
        this.logger = new common_1.Logger(WeatherService_1.name);
    }
    async getWeather(city) {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            return this.getMockWeather(city);
        }
        try {
            const { data } = await axios_1.default.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
            return {
                city: data.name,
                temp: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
            };
        }
        catch (e) {
            this.logger.error(`Weather fetch failed for ${city}:`, e.message);
            return this.getMockWeather(city);
        }
    }
    getMockWeather(city) {
        return {
            city,
            temp: 22,
            feelsLike: 20,
            description: 'partly cloudy',
            humidity: 65,
            windSpeed: 3.5,
        };
    }
};
exports.WeatherService = WeatherService;
exports.WeatherService = WeatherService = WeatherService_1 = __decorate([
    (0, common_1.Injectable)()
], WeatherService);
//# sourceMappingURL=weather.service.js.map