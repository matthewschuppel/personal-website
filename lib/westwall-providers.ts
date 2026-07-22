import type { WestWallSavedLocation, WestWallStockTicker, WestWallUpcomingFlight, WestWallWeatherLocation } from "@/data/westwall";

export type AircraftProviderName = "OpenSky" | "ADS-B Exchange" | "FlightAware" | "Custom API";

export type NearbyAircraft = {
  callsign: string;
  airline: string;
  aircraftType: string;
  altitudeFeet: number;
  distanceMiles: number;
  bearing: string;
};

export type StockQuote = {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  marketStatus: "open" | "closed" | "unknown";
};

export type WeatherIcon = "sun" | "partly-cloudy" | "cloud" | "fog" | "rain" | "snow" | "storm";

export type WeatherSnapshot = {
  location: string;
  temperature: number;
  feelsLike: number;
  conditions: string;
  high: number;
  low: number;
  rainChance: number;
  wind: string;
  severeAlert: boolean;
  icon: WeatherIcon;
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
  };
};

const weatherLabels: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Storm with hail",
  99: "Storm with hail"
};

function iconForWeatherCode(code: number): WeatherIcon {
  if (code === 0 || code === 1) return "sun";
  if (code === 2) return "partly-cloudy";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  return "rain";
}

export async function getUpcomingFlightsFromProvider(): Promise<WestWallUpcomingFlight[]> {
  return [];
}

export async function getNearbyAircraftFromProvider(_location: WestWallSavedLocation): Promise<NearbyAircraft[]> {
  void _location;
  return [];
}

export async function getStockQuotesFromProvider(_tickers: WestWallStockTicker[]): Promise<StockQuote[]> {
  void _tickers;
  return [];
}

export async function getWeatherFromProvider(location: WestWallWeatherLocation, units: "imperial" | "metric" = "imperial"): Promise<WeatherSnapshot | null> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    temperature_unit: units === "imperial" ? "fahrenheit" : "celsius",
    wind_speed_unit: units === "imperial" ? "mph" : "kmh",
    precipitation_unit: "inch",
    timezone: "auto",
    forecast_days: "1"
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    next: { revalidate: 60 * 15 }
  });
  if (!response.ok) return null;

  const weather = await response.json() as OpenMeteoResponse;
  if (!weather.current) return null;
  const code = weather.current.weather_code ?? -1;
  const windUnit = units === "imperial" ? "MPH" : "KM/H";

  return {
    location: location.name,
    temperature: Math.round(weather.current.temperature_2m ?? 0),
    feelsLike: Math.round(weather.current.apparent_temperature ?? weather.current.temperature_2m ?? 0),
    conditions: weatherLabels[code] ?? "Current conditions",
    high: Math.round(weather.daily?.temperature_2m_max?.[0] ?? weather.current.temperature_2m ?? 0),
    low: Math.round(weather.daily?.temperature_2m_min?.[0] ?? weather.current.temperature_2m ?? 0),
    rainChance: Math.round(weather.daily?.precipitation_probability_max?.[0] ?? 0),
    wind: `${Math.round(weather.current.wind_speed_10m ?? 0)} ${windUnit}`,
    severeAlert: code >= 95,
    icon: iconForWeatherCode(code)
  };
}
