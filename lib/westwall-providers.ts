import type { WestWallFeedHealth, WestWallSavedLocation, WestWallStockTicker, WestWallUpcomingFlight, WestWallWeatherLocation } from "@/data/westwall";

export type AircraftProviderName = "ADSB.lol" | "OpenSky" | "ADS-B Exchange" | "FlightAware" | "Custom API";

export type NearbyAircraft = {
  callsign: string;
  airline: string;
  carrierCode: string;
  registration: string;
  aircraftType: string;
  altitudeFeet: number;
  distanceMiles: number;
  bearing: string;
  groundSpeedKnots: number;
  seenSeconds: number;
};

export type StockQuote = {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  marketStatus: "open" | "closed" | "unknown";
  trend: string;
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
  alertHeadline: string;
  icon: WeatherIcon;
  aqi: number;
  sunrise: string;
  sunset: string;
  hourly: Array<{ time: string; temperature: number; rainChance: number; icon: WeatherIcon }>;
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
    sunrise?: string[];
    sunset?: string[];
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    precipitation_probability?: number[];
    weather_code?: number[];
  };
};

type OpenMeteoAqiResponse = { current?: { us_aqi?: number } };
type NwsAlertResponse = { features?: Array<{ properties?: { headline?: string; severity?: string } }> };

type AdsbLolAircraft = {
  flight?: string;
  r?: string;
  t?: string;
  ownOp?: string;
  desc?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | "ground";
  alt_geom?: number;
  gs?: number;
  seen?: number;
};

type AdsbLolResponse = {
  ac?: AdsbLolAircraft[];
};

type NasdaqQuoteData = {
  symbol?: string;
  marketStatus?: string;
  primaryData?: {
    lastSalePrice?: string;
    netChange?: string;
    percentageChange?: string;
  };
};

type NasdaqQuoteResponse = {
  data?: NasdaqQuoteData;
};

type NasdaqChartResponse = { data?: { chart?: Array<Record<string, unknown>> } };

type CacheEntry = { value: unknown; updatedAt: string };
const providerCache = new Map<string, CacheEntry>();
const providerHealth = new Map<WestWallFeedHealth["key"], WestWallFeedHealth>();

const providerLabels: Record<WestWallFeedHealth["key"], string> = {
  calendar: "Apple Calendar",
  weather: "Corinth weather",
  aircraft: "Aircraft over Corinth",
  markets: "Market prices"
};

function markHealth(key: WestWallFeedHealth["key"], status: WestWallFeedHealth["status"], updatedAt: string, detail: string) {
  providerHealth.set(key, { key, label: providerLabels[key], status, updatedAt, detail });
}

async function cachedProvider<T>(key: WestWallFeedHealth["key"], cacheKey: string, loader: () => Promise<T>): Promise<T> {
  try {
    const value = await loader();
    const updatedAt = new Date().toISOString();
    providerCache.set(cacheKey, { value, updatedAt });
    markHealth(key, "live", updatedAt, "Live provider response");
    return value;
  } catch (error) {
    const previous = providerCache.get(cacheKey);
    if (previous) {
      markHealth(key, "cached", previous.updatedAt, "Showing the most recent successful update");
      return previous.value as T;
    }
    markHealth(key, "unavailable", new Date().toISOString(), error instanceof Error ? error.message : "Provider unavailable");
    throw error;
  }
}

export function getWestWallProviderHealth(): WestWallFeedHealth[] {
  return (["calendar", "weather", "aircraft", "markets"] as const).map((key) => providerHealth.get(key) ?? {
    key,
    label: providerLabels[key],
    status: "unavailable",
    updatedAt: "",
    detail: "Waiting for first update"
  });
}

export function setWestWallCalendarHealth(status: WestWallFeedHealth["status"], detail: string) {
  markHealth("calendar", status, new Date().toISOString(), detail);
}

const airlinePrefixes: Record<string, { name: string; code: string }> = {
  AAL: { name: "American Airlines", code: "AA" },
  SWA: { name: "Southwest Airlines", code: "WN" },
  UAL: { name: "United Airlines", code: "UA" },
  DAL: { name: "Delta Air Lines", code: "DL" },
  ASA: { name: "Alaska Airlines", code: "AS" },
  JBU: { name: "JetBlue", code: "B6" },
  NKS: { name: "Spirit Airlines", code: "NK" },
  FFT: { name: "Frontier Airlines", code: "F9" },
  SKW: { name: "SkyWest", code: "OO" },
  ENY: { name: "Envoy Air", code: "MQ" },
  RPA: { name: "Republic Airways", code: "YX" },
  EDV: { name: "Endeavor Air", code: "9E" },
  JIA: { name: "PSA Airlines", code: "OH" }
};

function numericValue(value: string | undefined) {
  const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function distanceMiles(fromLat: number, fromLon: number, toLat: number, toLon: number) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latDistance = radians(toLat - fromLat);
  const lonDistance = radians(toLon - fromLon);
  const a = Math.sin(latDistance / 2) ** 2
    + Math.cos(radians(fromLat)) * Math.cos(radians(toLat)) * Math.sin(lonDistance / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearing(fromLat: number, fromLon: number, toLat: number, toLon: number) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const y = Math.sin(radians(toLon - fromLon)) * Math.cos(radians(toLat));
  const x = Math.cos(radians(fromLat)) * Math.sin(radians(toLat))
    - Math.sin(radians(fromLat)) * Math.cos(radians(toLat)) * Math.cos(radians(toLon - fromLon));
  const degrees = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(degrees / 45) % 8];
}

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

export async function getNearbyAircraftFromProvider(location: WestWallSavedLocation): Promise<NearbyAircraft[]> {
  const radiusMiles = Math.max(1, Math.min(25, location.radiusMiles || 10));
  const radiusNauticalMiles = Math.max(1, Math.ceil(radiusMiles / 1.15078));
  return cachedProvider("aircraft", `aircraft:${location.latitude}:${location.longitude}:${radiusMiles}`, async () => {
    const response = await fetch(`https://api.adsb.lol/v2/point/${location.latitude}/${location.longitude}/${radiusNauticalMiles}`, {
      headers: { "User-Agent": "MatthewOS-WestWall/2.0" },
      next: { revalidate: Math.max(5, Math.min(10, location.refreshIntervalSeconds || 10)) }
    });
    if (!response.ok) throw new Error(`ADSB.lol returned ${response.status}`);
    const payload = await response.json() as AdsbLolResponse;
    return (payload.ac ?? []).flatMap((aircraft) => {
    if (typeof aircraft.lat !== "number" || typeof aircraft.lon !== "number") return [];
    const seenSeconds = Number(aircraft.seen ?? 99);
    const miles = distanceMiles(location.latitude, location.longitude, aircraft.lat, aircraft.lon);
    if (seenSeconds > 15 || miles > radiusMiles || aircraft.alt_baro === "ground") return [];
    const callsign = aircraft.flight?.trim().toUpperCase() || aircraft.r?.trim().toUpperCase() || "UNKNOWN";
    const prefix = airlinePrefixes[callsign.slice(0, 3)];
    const altitude = typeof aircraft.alt_baro === "number" ? aircraft.alt_baro : aircraft.alt_geom ?? 0;
    return [{
      callsign,
      airline: prefix?.name || aircraft.ownOp?.trim() || "Private aircraft",
      carrierCode: prefix?.code || "",
      registration: aircraft.r?.trim().toUpperCase() || "",
      aircraftType: aircraft.t?.trim().toUpperCase() || aircraft.desc?.trim().toUpperCase() || "AIRCRAFT",
      altitudeFeet: Math.round(altitude),
      distanceMiles: Math.round(miles * 10) / 10,
      bearing: bearing(location.latitude, location.longitude, aircraft.lat, aircraft.lon),
      groundSpeedKnots: Math.round(aircraft.gs ?? 0),
      seenSeconds
    }];
    }).sort((a, b) => a.distanceMiles - b.distanceMiles || a.altitudeFeet - b.altitudeFeet);
  });
}

function asciiTrend(values: number[]) {
  if (values.length < 2) return "--------";
  const sampled = values.filter(Number.isFinite).slice(-8);
  const low = Math.min(...sampled);
  const high = Math.max(...sampled);
  const glyphs = "._-^";
  if (high === low) return "-".repeat(sampled.length);
  return sampled.map((value) => glyphs[Math.min(3, Math.round((value - low) / (high - low) * 3))]).join("");
}

export async function getStockQuotesFromProvider(tickers: WestWallStockTicker[]): Promise<StockQuote[]> {
  return cachedProvider("markets", `markets:${tickers.map((ticker) => ticker.symbol).join(",")}`, async () => {
    const quotes = await Promise.all(tickers.map(async (ticker) => {
    if (ticker.assetType === "Crypto") return null;
    const assetClass = ticker.assetType === "ETF" ? "etf" : ticker.assetType === "Index" ? "index" : "stocks";
    const headers = {
      Accept: "application/json, text/plain, */*",
      "User-Agent": "Mozilla/5.0 (compatible; MatthewOS-WestWall/2.0)"
    };
    const [quoteResponse, chartResponse] = await Promise.all([
      fetch(`https://api.nasdaq.com/api/quote/${encodeURIComponent(ticker.symbol)}/info?assetclass=${assetClass}`, {
        headers,
        next: { revalidate: Math.max(30, Math.min(120, ticker.refreshIntervalSeconds || 60)) }
      }),
      fetch(`https://api.nasdaq.com/api/quote/${encodeURIComponent(ticker.symbol)}/chart?assetclass=${assetClass}`, {
        headers,
        next: { revalidate: Math.max(60, Math.min(300, ticker.refreshIntervalSeconds || 60)) }
      }).catch(() => null)
    ]);
    if (!quoteResponse.ok) return null;
    const payload = await quoteResponse.json() as NasdaqQuoteResponse;
    const quote = payload.data?.primaryData;
    const price = numericValue(quote?.lastSalePrice);
    if (!price) return null;
    let trendValues: number[] = [];
    if (chartResponse?.ok) {
      const chartPayload = await chartResponse.json() as NasdaqChartResponse;
      trendValues = (chartPayload.data?.chart ?? []).map((point) => numericValue(String(point.y ?? point.value ?? point.close ?? ""))).filter(Boolean);
    }
    return {
      symbol: payload.data?.symbol?.toUpperCase() || ticker.symbol,
      price,
      change: numericValue(quote?.netChange),
      percentChange: numericValue(quote?.percentageChange),
      marketStatus: payload.data?.marketStatus?.toLowerCase().includes("open") ? "open" as const : "closed" as const,
      trend: asciiTrend(trendValues)
    };
  }));
    const available = quotes.filter((quote) => quote !== null) as StockQuote[];
    if (!available.length && tickers.length) throw new Error("No current market quotes were returned");
    return available;
  });
}

export async function getWeatherFromProvider(location: WestWallWeatherLocation, units: "imperial" | "metric" = "imperial"): Promise<WeatherSnapshot | null> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
    temperature_unit: units === "imperial" ? "fahrenheit" : "celsius",
    wind_speed_unit: units === "imperial" ? "mph" : "kmh",
    precipitation_unit: "inch",
    timezone: "auto",
    forecast_days: "2"
  });
  return cachedProvider("weather", `weather:${location.latitude}:${location.longitude}:${units}`, async () => {
    const aqiParams = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude), current: "us_aqi", timezone: "auto" });
    const [weatherResponse, aqiResult, alertResult] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { next: { revalidate: 60 * 10 } }),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${aqiParams}`, { next: { revalidate: 60 * 15 } }).then((response) => response.ok ? response.json() as Promise<OpenMeteoAqiResponse> : null).catch(() => null),
      fetch(`https://api.weather.gov/alerts/active?point=${location.latitude},${location.longitude}`, {
        headers: { Accept: "application/geo+json", "User-Agent": "MatthewOS-WestWall/2.0 (matthewschuppel.com)" },
        next: { revalidate: 60 }
      }).then((response) => response.ok ? response.json() as Promise<NwsAlertResponse> : null).catch(() => null)
    ]);
    if (!weatherResponse.ok) throw new Error(`Open-Meteo returned ${weatherResponse.status}`);
    const weather = await weatherResponse.json() as OpenMeteoResponse;
    if (!weather.current) throw new Error("Weather response did not include current conditions");
    const code = weather.current.weather_code ?? -1;
    const windUnit = units === "imperial" ? "MPH" : "KM/H";
    const currentHour = new Date().toISOString().slice(0, 13);
    const startIndex = Math.max(0, weather.hourly?.time?.findIndex((time) => time.startsWith(currentHour)) ?? 0);
    const hourly = (weather.hourly?.time ?? []).slice(startIndex, startIndex + 6).map((time, offset) => ({
      time,
      temperature: Math.round(weather.hourly?.temperature_2m?.[startIndex + offset] ?? 0),
      rainChance: Math.round(weather.hourly?.precipitation_probability?.[startIndex + offset] ?? 0),
      icon: iconForWeatherCode(weather.hourly?.weather_code?.[startIndex + offset] ?? code)
    }));
    const alert = alertResult?.features?.[0]?.properties;
    return {
    location: location.name,
    temperature: Math.round(weather.current.temperature_2m ?? 0),
    feelsLike: Math.round(weather.current.apparent_temperature ?? weather.current.temperature_2m ?? 0),
    conditions: weatherLabels[code] ?? "Current conditions",
    high: Math.round(weather.daily?.temperature_2m_max?.[0] ?? weather.current.temperature_2m ?? 0),
    low: Math.round(weather.daily?.temperature_2m_min?.[0] ?? weather.current.temperature_2m ?? 0),
    rainChance: Math.round(weather.daily?.precipitation_probability_max?.[0] ?? 0),
    wind: `${Math.round(weather.current.wind_speed_10m ?? 0)} ${windUnit}`,
      severeAlert: code >= 95 || Boolean(alert),
      alertHeadline: alert?.headline ?? "",
      icon: iconForWeatherCode(code),
      aqi: Math.round(aqiResult?.current?.us_aqi ?? 0),
      sunrise: weather.daily?.sunrise?.[0] ?? "",
      sunset: weather.daily?.sunset?.[0] ?? "",
      hourly
    };
  });
}
