export type WestWallDevice = {
  id: string;
  name: string;
  slug: string;
  status: "online" | "offline" | "sleeping";
  lastCheckIn: string;
  activeScreen: string;
  brightness: number;
  wifiRssi: number;
  firmwareVersion: string;
  apiKeyHint: string;
};

export type WestWallScreenKey =
  | "upcoming-flights"
  | "nearby-aircraft"
  | "stocks"
  | "weather"
  | "clock"
  | "custom-message"
  | "calendar-preview"
  | "home-status";

export type WestWallRotationScreen = {
  id: string;
  key: WestWallScreenKey;
  label: string;
  enabled: boolean;
  durationSeconds: number;
  priority: number;
  preview: string;
};

export type WestWallUpcomingFlight = {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  gate: string;
  terminal: string;
  status: string;
  seat: string;
  confirmation: string;
  source: "manual" | "calendar";
  sourceEventId: string;
  syncedAt: string;
};

export type WestWallSavedLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMiles: number;
  altitudeFilter: string;
  airlineFilter: string;
  aircraftTypeFilter: string;
  refreshIntervalSeconds: number;
  dataSource: "ADSB.lol" | "OpenSky" | "ADS-B Exchange" | "FlightAware" | "Custom API";
  isDefault: boolean;
};

export type WestWallStockTicker = {
  id: string;
  symbol: string;
  label: string;
  enabled: boolean;
  assetType: "Index" | "Stock" | "ETF" | "Crypto";
  showPrice: boolean;
  showChange: boolean;
  showPercentChange: boolean;
  showTrendArrow: boolean;
  refreshIntervalSeconds: number;
  priority: number;
};

export type WestWallWeatherLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
};

export type WestWallAppearanceSettings = {
  globalBrightness: number;
  autoBrightness: boolean;
  dayBrightness: number;
  nightBrightness: number;
  sleepStart: string;
  sleepEnd: string;
  colorTheme: "Amber" | "Cyan" | "White" | "Classic RGB";
  fontSize: "Small" | "Medium" | "Large";
  scrollSpeed: number;
  animationStyle: "None" | "Slide" | "Fade" | "Ticker";
  showIcons: boolean;
  dotMatrixPreview: boolean;
  units: "imperial" | "metric";
};

export type WestWallCommandLog = {
  id: string;
  command: string;
  status: "queued" | "sent" | "acknowledged" | "failed";
  createdAt: string;
  payload?: string;
};

export type WestWallDeviceCheckin = {
  id: string;
  firmwareVersion: string;
  wifiRssi: number;
  uptimeSeconds: number;
  freeMemoryBytes: number;
  currentScreen: string;
  createdAt: string;
};

export type WestWallCustomMessage = {
  id: string;
  title: string;
  message: string;
  enabled: boolean;
  startsAt: string;
  endsAt: string;
  priority: number;
};

export type WestWallDashboardData = {
  device: WestWallDevice;
  rotation: WestWallRotationScreen[];
  flights: WestWallUpcomingFlight[];
  locations: WestWallSavedLocation[];
  stocks: WestWallStockTicker[];
  weatherLocations: WestWallWeatherLocation[];
  appearance: WestWallAppearanceSettings;
  commands: WestWallCommandLog[];
  checkins: WestWallDeviceCheckin[];
  messages: WestWallCustomMessage[];
};

export const mockWestWallDevice: WestWallDevice = {
  id: "display-westwall",
  name: "WestWall Office Display",
  slug: "westwall",
  status: "offline",
  lastCheckIn: "Waiting for first ESP32 check-in",
  activeScreen: "Weather",
  brightness: 68,
  wifiRssi: -58,
  firmwareVersion: "0.1.0-dev",
  apiKeyHint: "Set WESTWALL_DEVICE_TOKEN in Cloudflare"
};

export const mockWestWallRotation: WestWallRotationScreen[] = [
  { id: "screen-flights", key: "upcoming-flights", label: "Upcoming Flights", enabled: true, durationSeconds: 18, priority: 1, preview: "AA 2481 DFW -> ORD 8:35A" },
  { id: "screen-aircraft", key: "nearby-aircraft", label: "Aircraft Over Corinth", enabled: true, durationSeconds: 14, priority: 2, preview: "Live ADS-B within 10 miles" },
  { id: "screen-stocks", key: "stocks", label: "Stock Ticker", enabled: true, durationSeconds: 20, priority: 3, preview: "SPY 627.12 +0.4%  AAPL +1.1%" },
  { id: "screen-weather", key: "weather", label: "Weather", enabled: true, durationSeconds: 16, priority: 4, preview: "Corinth 91F Sunny Wind 9mph" },
  { id: "screen-clock", key: "clock", label: "Clock", enabled: true, durationSeconds: 10, priority: 5, preview: "Tue 6:42 PM" },
  { id: "screen-message", key: "custom-message", label: "Custom Message", enabled: false, durationSeconds: 12, priority: 6, preview: "Welcome home, Matthew" },
  { id: "screen-calendar", key: "calendar-preview", label: "Calendar Preview", enabled: true, durationSeconds: 14, priority: 7, preview: "7:30 Dinner / Tomorrow: Travel" },
  { id: "screen-home", key: "home-status", label: "Home Status / Future Widgets", enabled: false, durationSeconds: 12, priority: 8, preview: "Home systems nominal" }
];

export const mockWestWallFlights: WestWallUpcomingFlight[] = [
  {
    id: "flight-001",
    airline: "American Airlines",
    flightNumber: "AA 2481",
    departureAirport: "DFW",
    arrivalAirport: "ORD",
    departureTime: "2026-07-12T08:35:00",
    arrivalTime: "2026-07-12T11:05:00",
    gate: "A18",
    terminal: "A",
    status: "On time",
    seat: "12A",
    confirmation: "Private",
    source: "manual",
    sourceEventId: "",
    syncedAt: ""
  }
];

export const mockWestWallLocations: WestWallSavedLocation[] = [
  {
    id: "loc-001",
    name: "Corinth, TX",
    latitude: 33.143288,
    longitude: -97.068141,
    radiusMiles: 10,
    altitudeFilter: "0-45000 ft",
    airlineFilter: "All",
    aircraftTypeFilter: "All",
    refreshIntervalSeconds: 10,
    dataSource: "ADSB.lol",
    isDefault: true
  }
];

export const mockWestWallStocks: WestWallStockTicker[] = [
  { id: "ticker-001", symbol: "SPY", label: "S&P 500 ETF", enabled: true, assetType: "ETF", showPrice: true, showChange: true, showPercentChange: true, showTrendArrow: true, refreshIntervalSeconds: 120, priority: 1 },
  { id: "ticker-002", symbol: "AAPL", label: "Apple", enabled: true, assetType: "Stock", showPrice: true, showChange: true, showPercentChange: true, showTrendArrow: true, refreshIntervalSeconds: 120, priority: 2 },
  { id: "ticker-003", symbol: "BTC", label: "Bitcoin", enabled: false, assetType: "Crypto", showPrice: true, showChange: false, showPercentChange: true, showTrendArrow: true, refreshIntervalSeconds: 180, priority: 3 }
];

export const mockWestWallWeatherLocations: WestWallWeatherLocation[] = [
  { id: "weather-001", name: "Corinth, TX", latitude: 33.143288, longitude: -97.068141, isDefault: true }
];

export const mockWestWallAppearance: WestWallAppearanceSettings = {
  globalBrightness: 68,
  autoBrightness: true,
  dayBrightness: 82,
  nightBrightness: 22,
  sleepStart: "23:00",
  sleepEnd: "06:30",
  colorTheme: "Amber",
  fontSize: "Medium",
  scrollSpeed: 42,
  animationStyle: "Ticker",
  showIcons: true,
  dotMatrixPreview: true,
  units: "imperial"
};

export const mockWestWallCommands: WestWallCommandLog[] = [
  { id: "cmd-001", command: "test_pattern", status: "queued", createdAt: "Mock data" }
];

export const mockWestWallCheckins: WestWallDeviceCheckin[] = [
  { id: "checkin-001", firmwareVersion: "0.1.0-dev", wifiRssi: -58, uptimeSeconds: 0, freeMemoryBytes: 183500, currentScreen: "Weather", createdAt: "Mock data" }
];

export const mockWestWallMessages: WestWallCustomMessage[] = [
  {
    id: "message-001",
    title: "Welcome Home",
    message: "Welcome home, Matthew",
    enabled: false,
    startsAt: "",
    endsAt: "",
    priority: 1
  }
];

export const mockWestWallData: WestWallDashboardData = {
  device: mockWestWallDevice,
  rotation: mockWestWallRotation,
  flights: mockWestWallFlights,
  locations: mockWestWallLocations,
  stocks: mockWestWallStocks,
  weatherLocations: mockWestWallWeatherLocations,
  appearance: mockWestWallAppearance,
  commands: mockWestWallCommands,
  checkins: mockWestWallCheckins,
  messages: mockWestWallMessages
};
