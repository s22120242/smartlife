import api from './api'

export interface HourlyData {
  time: string
  temp: string
  description: string
  icon: string
  windSpeed: string
}

export interface WeatherData {
  city: string
  country: string
  temperature: string
  feelsLike: string
  humidity: string
  windSpeed: string
  description: string
  icon: string
  hourly: HourlyData[]
  forecast: {
    date: string
    maxTemp: string
    minTemp: string
    description: string
    icon: string
  }[]
}

export const weatherService = {
  getWeather: (city: string = 'Mexico City') =>
    api.get<WeatherData>(`/weather?city=${encodeURIComponent(city)}`),
}
