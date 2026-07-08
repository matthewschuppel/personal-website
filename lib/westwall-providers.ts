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
};

// Future integration points:
// - Flights: Gmail, Google Calendar, TripIt, airline APIs, or manual entries.
// - Aircraft: OpenSky, ADS-B Exchange, FlightAware, or a private proxy.
// - Stocks: market data APIs for indexes, stocks, ETFs, and crypto.
// - Weather: Open-Meteo, NOAA, Apple WeatherKit, or another weather provider.

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

export async function getWeatherFromProvider(_location: WestWallWeatherLocation): Promise<WeatherSnapshot | null> {
  void _location;
  return null;
}
