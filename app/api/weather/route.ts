import { NextResponse } from "next/server";

type GeocodingResult = {
  name: string;
  admin1?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
};

type GeocodingResponse = {
  results?: GeocodingResult[];
};

type WeatherResponse = {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  current_units?: {
    temperature_2m?: string;
    apparent_temperature?: string;
    wind_speed_10m?: string;
  };
};

const fallbackLocation = "Corinth, TX";
const fallbackGeocoded: GeocodingResult = {
  name: "Corinth",
  admin1: "Texas",
  country_code: "US",
  latitude: 33.143288,
  longitude: -97.068141
};

const weatherCodeLabels: Record<number, string> = {
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
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail"
};

function formatLocation(result: GeocodingResult) {
  return [result.name, result.admin1, result.country_code].filter(Boolean).join(", ");
}

async function geocodeLocation(location: string) {
  const params = new URLSearchParams({
    name: location,
    count: "1",
    language: "en",
    format: "json"
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
    next: { revalidate: 60 * 30 }
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json() as GeocodingResponse;
  return data.results?.[0] ?? null;
}

async function getWeather(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "auto"
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    next: { revalidate: 60 * 15 }
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<WeatherResponse>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedLocation = searchParams.get("location")?.trim() || fallbackLocation;
  const geocoded = requestedLocation.toLowerCase() === fallbackLocation.toLowerCase()
    ? fallbackGeocoded
    : await geocodeLocation(requestedLocation) ?? fallbackGeocoded;

  if (!geocoded) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const weather = await getWeather(geocoded.latitude, geocoded.longitude);
  const current = weather?.current;

  if (!current) {
    return NextResponse.json({ error: "Weather unavailable" }, { status: 502 });
  }

  return NextResponse.json({
    location: formatLocation(geocoded),
    requestedLocation,
    temperature: Math.round(current.temperature_2m ?? 0),
    feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 0),
    condition: weatherCodeLabels[current.weather_code ?? -1] ?? "Current conditions",
    windSpeed: Math.round(current.wind_speed_10m ?? 0),
    precipitation: current.precipitation ?? 0,
    units: {
      temperature: weather.current_units?.temperature_2m ?? "F",
      windSpeed: weather.current_units?.wind_speed_10m ?? "mph"
    },
    source: "Open-Meteo"
  });
}
