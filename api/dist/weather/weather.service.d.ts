export declare class WeatherService {
    private readonly logger;
    getWeather(city: string): Promise<{
        city: any;
        temp: number;
        feelsLike: number;
        description: any;
        humidity: any;
        windSpeed: any;
    }>;
    private getMockWeather;
}
