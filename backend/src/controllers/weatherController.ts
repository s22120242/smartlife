import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const citySchema = z.object({
  city: z.string().min(1).default("Mexico City"),
});

export const weatherController = {
  async getWeather(req: AuthRequest, res: Response) {
    try {
      const { city } = citySchema.parse(req.query);
      const response = await fetch(
        `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
        { headers: { "User-Agent": "SmartLifeOrganizer/1.0" } }
      );
      if (!response.ok) {
        return res.status(502).json({ error: "Error al obtener clima del servicio externo" });
      }
      const data: any = await response.json();
      const current = data.current_condition?.[0];
      const forecast = data.weather?.slice(0, 3) || [];

      const todayForecast = data.weather?.[0];
      const hourly = todayForecast?.hourly?.map((h: Record<string, any>) => {
        const hour = Math.floor(Number(h.time) / 100);
        return {
          time: `${String(hour).padStart(2, "0")}:00`,
          temp: h.tempC ? `${h.tempC}°C` : "N/A",
          description: h.weatherDesc?.[0]?.value || "",
          icon: h.weatherIconUrl?.[0]?.value || "",
          windSpeed: h.windspeedKmph ? `${h.windspeedKmph} km/h` : "N/A",
        };
      }) || [];

      res.json({
        city: data.nearest_area?.[0]?.areaName?.[0]?.value || city,
        country: data.nearest_area?.[0]?.country?.[0]?.value || "",
        temperature: current?.temp_C ? `${current.temp_C}°C` : "N/A",
        feelsLike: current?.FeelsLikeC ? `${current.FeelsLikeC}°C` : "N/A",
        humidity: current?.humidity ? `${current.humidity}%` : "N/A",
        windSpeed: current?.windspeedKmph ? `${current.windspeedKmph} km/h` : "N/A",
        description: current?.weatherDesc?.[0]?.value || "N/A",
        icon: current?.weatherIconUrl?.[0]?.value || "",
        hourly,
        forecast: forecast.map((day: Record<string, any>) => ({
          date: day.date,
          maxTemp: day.maxtempC,
          minTemp: day.mintempC,
          description: day.hourly?.[0]?.weatherDesc?.[0]?.value || "",
          icon: day.hourly?.[0]?.weatherIconUrl?.[0]?.value || "",
        })),
      });
    } catch {
      res.status(500).json({ error: "Error al consultar servicio de clima" });
    }
  },
};
