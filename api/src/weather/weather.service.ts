import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  async getWeather(city: string) {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      // Return mock data if no API key
      return this.getMockWeather(city);
    }
    try {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
      );
      return {
        city: data.name,
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
      };
    } catch (e) {
      this.logger.error(`Weather fetch failed for ${city}:`, e.message);
      return this.getMockWeather(city);
    }
  }

  private getMockWeather(city: string) {
    return {
      city,
      temp: 22,
      feelsLike: 20,
      description: 'partly cloudy',
      humidity: 65,
      windSpeed: 3.5,
    };
  }
}
