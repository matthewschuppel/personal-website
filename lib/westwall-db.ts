import {
  mockWestWallAppearance,
  mockWestWallCommands,
  mockWestWallData,
  mockWestWallDevice,
  mockWestWallFlights,
  mockWestWallLocations,
  mockWestWallMessages,
  mockWestWallRotation,
  mockWestWallStocks,
  mockWestWallWeatherLocations,
  type WestWallAppearanceSettings,
  type WestWallCommandLog,
  type WestWallDashboardData,
  type WestWallDevice,
  type WestWallDeviceCheckin,
  type WestWallCustomMessage,
  type WestWallRotationScreen,
  type WestWallSavedLocation,
  type WestWallStockTicker,
  type WestWallUpcomingFlight,
  type WestWallWeatherLocation
} from "@/data/westwall";
import { createId, getD1Database } from "@/lib/d1";

const DEFAULT_DEVICE_ID = "display-westwall";
const DEFAULT_DEVICE_SLUG = "westwall";

type DeviceRow = {
  id: string;
  name: string;
  slug: string;
  status: WestWallDevice["status"];
  last_check_in: string | null;
  active_screen: string | null;
  brightness: number;
  wifi_rssi: number | null;
  firmware_version: string | null;
};

type RotationRow = {
  id: string;
  screen_key: WestWallRotationScreen["key"];
  label: string;
  enabled: number;
  duration_seconds: number;
  priority: number;
  preview: string | null;
};

type FlightRow = {
  id: string;
  airline: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string | null;
  arrival_time: string | null;
  gate: string | null;
  terminal: string | null;
  status: string | null;
  seat: string | null;
  confirmation: string | null;
};

type LocationRow = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_miles: number;
  altitude_filter: string | null;
  airline_filter: string | null;
  aircraft_type_filter: string | null;
  refresh_interval_seconds: number;
  data_source: WestWallSavedLocation["dataSource"];
  is_default: number;
};

type TickerRow = {
  id: string;
  symbol: string;
  label: string | null;
  enabled: number;
  asset_type: WestWallStockTicker["assetType"];
  show_price: number;
  show_change: number;
  show_percent_change: number;
  show_trend_arrow: number;
  refresh_interval_seconds: number;
  priority: number;
};

type WeatherLocationRow = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  is_default: number;
};

type SettingsRow = {
  global_brightness: number;
  auto_brightness: number;
  day_brightness: number;
  night_brightness: number;
  sleep_start: string;
  sleep_end: string;
  color_theme: WestWallAppearanceSettings["colorTheme"];
  font_size: WestWallAppearanceSettings["fontSize"];
  scroll_speed: number;
  animation_style: WestWallAppearanceSettings["animationStyle"];
  show_icons: number;
  dot_matrix_preview: number;
  units: WestWallAppearanceSettings["units"];
};

type CommandRow = {
  id: string;
  command: string;
  status: WestWallCommandLog["status"];
  payload: string | null;
  created_at: string;
};

type CheckinRow = {
  id: string;
  firmware_version: string | null;
  wifi_rssi: number | null;
  uptime_seconds: number | null;
  free_memory_bytes: number | null;
  current_screen: string | null;
  created_at: string;
};

type MessageRow = {
  id: string;
  title: string;
  message: string;
  enabled: number;
  starts_at: string | null;
  ends_at: string | null;
  priority: number;
};

function getDbOrNull() {
  return getD1Database();
}

function bool(value: boolean) {
  return value ? 1 : 0;
}

function toDevice(row: DeviceRow): WestWallDevice {
  const lastCheckInMs = row.last_check_in ? Date.parse(row.last_check_in) : 0;
  const isFresh = lastCheckInMs > 0 && Date.now() - lastCheckInMs < 5 * 60 * 1000;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: isFresh ? row.status : "offline",
    lastCheckIn: row.last_check_in ?? "Waiting for first ESP32 check-in",
    activeScreen: row.active_screen ?? "Weather",
    brightness: row.brightness,
    wifiRssi: row.wifi_rssi ?? -99,
    firmwareVersion: row.firmware_version ?? "Unknown",
    apiKeyHint: "Managed through WESTWALL_DEVICE_TOKEN or device api_key_hash"
  };
}

function toRotation(row: RotationRow): WestWallRotationScreen {
  return {
    id: row.id,
    key: row.screen_key,
    label: row.label,
    enabled: Boolean(row.enabled),
    durationSeconds: row.duration_seconds,
    priority: row.priority,
    preview: row.preview ?? ""
  };
}

function toFlight(row: FlightRow): WestWallUpcomingFlight {
  return {
    id: row.id,
    airline: row.airline,
    flightNumber: row.flight_number,
    departureAirport: row.departure_airport,
    arrivalAirport: row.arrival_airport,
    departureTime: row.departure_time ?? "",
    arrivalTime: row.arrival_time ?? "",
    gate: row.gate ?? "",
    terminal: row.terminal ?? "",
    status: row.status ?? "Unknown",
    seat: row.seat ?? "",
    confirmation: row.confirmation ?? ""
  };
}

function toLocation(row: LocationRow): WestWallSavedLocation {
  return {
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    radiusMiles: row.radius_miles,
    altitudeFilter: row.altitude_filter ?? "All",
    airlineFilter: row.airline_filter ?? "All",
    aircraftTypeFilter: row.aircraft_type_filter ?? "All",
    refreshIntervalSeconds: row.refresh_interval_seconds,
    dataSource: row.data_source,
    isDefault: Boolean(row.is_default)
  };
}

function toTicker(row: TickerRow): WestWallStockTicker {
  return {
    id: row.id,
    symbol: row.symbol,
    label: row.label ?? row.symbol,
    enabled: Boolean(row.enabled),
    assetType: row.asset_type,
    showPrice: Boolean(row.show_price),
    showChange: Boolean(row.show_change),
    showPercentChange: Boolean(row.show_percent_change),
    showTrendArrow: Boolean(row.show_trend_arrow),
    refreshIntervalSeconds: row.refresh_interval_seconds,
    priority: row.priority
  };
}

function toWeatherLocation(row: WeatherLocationRow): WestWallWeatherLocation {
  return {
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    isDefault: Boolean(row.is_default)
  };
}

function toAppearance(row: SettingsRow): WestWallAppearanceSettings {
  return {
    globalBrightness: row.global_brightness,
    autoBrightness: Boolean(row.auto_brightness),
    dayBrightness: row.day_brightness,
    nightBrightness: row.night_brightness,
    sleepStart: row.sleep_start,
    sleepEnd: row.sleep_end,
    colorTheme: row.color_theme,
    fontSize: row.font_size,
    scrollSpeed: row.scroll_speed,
    animationStyle: row.animation_style,
    showIcons: Boolean(row.show_icons),
    dotMatrixPreview: Boolean(row.dot_matrix_preview),
    units: row.units
  };
}

function toCommand(row: CommandRow): WestWallCommandLog {
  return {
    id: row.id,
    command: row.command,
    status: row.status,
    createdAt: row.created_at,
    payload: row.payload ?? undefined
  };
}

function toCheckin(row: CheckinRow): WestWallDeviceCheckin {
  return {
    id: row.id,
    firmwareVersion: row.firmware_version ?? "Unknown",
    wifiRssi: row.wifi_rssi ?? -99,
    uptimeSeconds: row.uptime_seconds ?? 0,
    freeMemoryBytes: row.free_memory_bytes ?? 0,
    currentScreen: row.current_screen ?? "Unknown",
    createdAt: row.created_at
  };
}

function toMessage(row: MessageRow): WestWallCustomMessage {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    enabled: Boolean(row.enabled),
    startsAt: row.starts_at ?? "",
    endsAt: row.ends_at ?? "",
    priority: row.priority
  };
}

export async function ensureWestWallSeeded() {
  const db = getDbOrNull();

  if (!db) return;

  const existing = await db.prepare("SELECT id FROM westwall_devices WHERE id = ?").bind(DEFAULT_DEVICE_ID).first<{ id: string }>().catch(() => null);

  if (existing) return;

  await db
    .prepare("INSERT INTO westwall_devices (id, name, slug, status, active_screen, brightness, wifi_rssi, firmware_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(DEFAULT_DEVICE_ID, mockWestWallDevice.name, DEFAULT_DEVICE_SLUG, mockWestWallDevice.status, mockWestWallDevice.activeScreen, mockWestWallDevice.brightness, mockWestWallDevice.wifiRssi, mockWestWallDevice.firmwareVersion)
    .run();

  await db
    .prepare(
      `INSERT INTO westwall_settings
      (id, device_id, global_brightness, auto_brightness, day_brightness, night_brightness, sleep_start, sleep_end, color_theme, font_size, scroll_speed, animation_style, show_icons, dot_matrix_preview, units)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind("settings-westwall", DEFAULT_DEVICE_ID, mockWestWallAppearance.globalBrightness, bool(mockWestWallAppearance.autoBrightness), mockWestWallAppearance.dayBrightness, mockWestWallAppearance.nightBrightness, mockWestWallAppearance.sleepStart, mockWestWallAppearance.sleepEnd, mockWestWallAppearance.colorTheme, mockWestWallAppearance.fontSize, mockWestWallAppearance.scrollSpeed, mockWestWallAppearance.animationStyle, bool(mockWestWallAppearance.showIcons), bool(mockWestWallAppearance.dotMatrixPreview), mockWestWallAppearance.units)
    .run();

  for (const screen of mockWestWallRotation) {
    await db
      .prepare("INSERT INTO westwall_rotation_screens (id, device_id, screen_key, label, enabled, duration_seconds, priority, preview) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(screen.id, DEFAULT_DEVICE_ID, screen.key, screen.label, bool(screen.enabled), screen.durationSeconds, screen.priority, screen.preview)
      .run();
  }

  for (const flight of mockWestWallFlights) {
    await createWestWallFlight(flight);
  }

  for (const location of mockWestWallLocations) {
    await createWestWallLocation(location);
  }

  for (const ticker of mockWestWallStocks) {
    await createWestWallTicker(ticker);
  }

  for (const location of mockWestWallWeatherLocations) {
    await createWestWallWeatherLocation(location);
  }

  for (const message of mockWestWallMessages) {
    await createWestWallMessage(message);
  }
}

export async function getWestWallDashboardData(): Promise<WestWallDashboardData> {
  const db = getDbOrNull();

  if (!db) return mockWestWallData;

  try {
    await ensureWestWallSeeded();

    const deviceRow = await db.prepare("SELECT id, name, slug, status, last_check_in, active_screen, brightness, wifi_rssi, firmware_version FROM westwall_devices WHERE slug = ?").bind(DEFAULT_DEVICE_SLUG).first<DeviceRow>();
    const settingsRow = await db.prepare("SELECT global_brightness, auto_brightness, day_brightness, night_brightness, sleep_start, sleep_end, color_theme, font_size, scroll_speed, animation_style, show_icons, dot_matrix_preview, units FROM westwall_settings WHERE device_id = ?").bind(DEFAULT_DEVICE_ID).first<SettingsRow>();
    const { results: rotationRows = [] } = await db.prepare("SELECT id, screen_key, label, enabled, duration_seconds, priority, preview FROM westwall_rotation_screens WHERE device_id = ? ORDER BY priority ASC").bind(DEFAULT_DEVICE_ID).all<RotationRow>();
    const { results: flightRows = [] } = await db.prepare("SELECT id, airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, gate, terminal, status, seat, confirmation FROM westwall_upcoming_flights WHERE device_id = ? ORDER BY departure_time ASC").bind(DEFAULT_DEVICE_ID).all<FlightRow>();
    const { results: locationRows = [] } = await db.prepare("SELECT id, name, latitude, longitude, radius_miles, altitude_filter, airline_filter, aircraft_type_filter, refresh_interval_seconds, data_source, is_default FROM westwall_saved_locations WHERE device_id = ? ORDER BY is_default DESC, name ASC").bind(DEFAULT_DEVICE_ID).all<LocationRow>();
    const { results: tickerRows = [] } = await db.prepare("SELECT id, symbol, label, enabled, asset_type, show_price, show_change, show_percent_change, show_trend_arrow, refresh_interval_seconds, priority FROM westwall_stock_tickers WHERE device_id = ? ORDER BY priority ASC").bind(DEFAULT_DEVICE_ID).all<TickerRow>();
    const { results: weatherRows = [] } = await db.prepare("SELECT id, name, latitude, longitude, is_default FROM westwall_weather_locations WHERE device_id = ? ORDER BY is_default DESC, name ASC").bind(DEFAULT_DEVICE_ID).all<WeatherLocationRow>();
    const { results: commandRows = [] } = await db.prepare("SELECT id, command, payload, status, created_at FROM westwall_command_logs WHERE device_id = ? ORDER BY created_at DESC LIMIT 10").bind(DEFAULT_DEVICE_ID).all<CommandRow>();
    const { results: checkinRows = [] } = await db.prepare("SELECT id, firmware_version, wifi_rssi, uptime_seconds, free_memory_bytes, current_screen, created_at FROM westwall_device_checkins WHERE device_id = ? ORDER BY created_at DESC LIMIT 10").bind(DEFAULT_DEVICE_ID).all<CheckinRow>();
    const { results: messageRows = [] } = await db.prepare("SELECT id, title, message, enabled, starts_at, ends_at, priority FROM westwall_custom_messages WHERE device_id = ? ORDER BY priority ASC").bind(DEFAULT_DEVICE_ID).all<MessageRow>();

    return {
      device: deviceRow ? toDevice(deviceRow) : mockWestWallDevice,
      rotation: rotationRows.length ? rotationRows.map(toRotation) : mockWestWallRotation,
      flights: flightRows.length ? flightRows.map(toFlight) : mockWestWallFlights,
      locations: locationRows.length ? locationRows.map(toLocation) : mockWestWallLocations,
      stocks: tickerRows.length ? tickerRows.map(toTicker) : mockWestWallStocks,
      weatherLocations: weatherRows.length ? weatherRows.map(toWeatherLocation) : mockWestWallWeatherLocations,
      appearance: settingsRow ? toAppearance(settingsRow) : mockWestWallAppearance,
      commands: commandRows.length ? commandRows.map(toCommand) : mockWestWallCommands,
      checkins: checkinRows.length ? checkinRows.map(toCheckin) : mockWestWallData.checkins,
      messages: messageRows.length ? messageRows.map(toMessage) : mockWestWallMessages
    };
  } catch {
    return mockWestWallData;
  }
}

export function isWestWallDeviceAuthorized(request: Request) {
  const configuredToken = process.env.WESTWALL_DEVICE_TOKEN;
  const header = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || request.headers.get("x-westwall-token");

  if (!configuredToken) {
    return process.env.NODE_ENV !== "production";
  }

  return Boolean(header && header === configuredToken);
}

export async function createWestWallFlight(input: Partial<WestWallUpcomingFlight>) {
  const db = getDbOrNull();
  const flight: WestWallUpcomingFlight = {
    id: input.id ?? createId("westwall-flight"),
    airline: input.airline?.trim() || "Airline",
    flightNumber: input.flightNumber?.trim() || "Flight",
    departureAirport: input.departureAirport?.trim() || "DFW",
    arrivalAirport: input.arrivalAirport?.trim() || "TBD",
    departureTime: input.departureTime ?? "",
    arrivalTime: input.arrivalTime ?? "",
    gate: input.gate ?? "",
    terminal: input.terminal ?? "",
    status: input.status ?? "Planned",
    seat: input.seat ?? "",
    confirmation: input.confirmation ?? ""
  };

  if (!db) return flight;

  await db
    .prepare("INSERT INTO westwall_upcoming_flights (id, device_id, airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, gate, terminal, status, seat, confirmation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(flight.id, DEFAULT_DEVICE_ID, flight.airline, flight.flightNumber, flight.departureAirport, flight.arrivalAirport, flight.departureTime, flight.arrivalTime, flight.gate, flight.terminal, flight.status, flight.seat, flight.confirmation)
    .run();

  return flight;
}

export async function createWestWallLocation(input: Partial<WestWallSavedLocation>) {
  const db = getDbOrNull();
  const location: WestWallSavedLocation = {
    id: input.id ?? createId("westwall-location"),
    name: input.name?.trim() || "Saved location",
    latitude: Number(input.latitude ?? 32.7767),
    longitude: Number(input.longitude ?? -96.797),
    radiusMiles: Number(input.radiusMiles ?? 25),
    altitudeFilter: input.altitudeFilter ?? "All",
    airlineFilter: input.airlineFilter ?? "All",
    aircraftTypeFilter: input.aircraftTypeFilter ?? "All",
    refreshIntervalSeconds: Number(input.refreshIntervalSeconds ?? 60),
    dataSource: input.dataSource ?? "OpenSky",
    isDefault: Boolean(input.isDefault)
  };

  if (!db) return location;

  await db
    .prepare("INSERT INTO westwall_saved_locations (id, device_id, name, latitude, longitude, radius_miles, altitude_filter, airline_filter, aircraft_type_filter, refresh_interval_seconds, data_source, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(location.id, DEFAULT_DEVICE_ID, location.name, location.latitude, location.longitude, location.radiusMiles, location.altitudeFilter, location.airlineFilter, location.aircraftTypeFilter, location.refreshIntervalSeconds, location.dataSource, bool(location.isDefault))
    .run();

  return location;
}

export async function createWestWallTicker(input: Partial<WestWallStockTicker>) {
  const db = getDbOrNull();
  const ticker: WestWallStockTicker = {
    id: input.id ?? createId("westwall-ticker"),
    symbol: input.symbol?.trim().toUpperCase() || "SPY",
    label: input.label?.trim() || input.symbol?.trim().toUpperCase() || "SPY",
    enabled: input.enabled ?? true,
    assetType: input.assetType ?? "Stock",
    showPrice: input.showPrice ?? true,
    showChange: input.showChange ?? true,
    showPercentChange: input.showPercentChange ?? true,
    showTrendArrow: input.showTrendArrow ?? true,
    refreshIntervalSeconds: Number(input.refreshIntervalSeconds ?? 120),
    priority: Number(input.priority ?? 10)
  };

  if (!db) return ticker;

  await db
    .prepare("INSERT INTO westwall_stock_tickers (id, device_id, symbol, label, enabled, asset_type, show_price, show_change, show_percent_change, show_trend_arrow, refresh_interval_seconds, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(ticker.id, DEFAULT_DEVICE_ID, ticker.symbol, ticker.label, bool(ticker.enabled), ticker.assetType, bool(ticker.showPrice), bool(ticker.showChange), bool(ticker.showPercentChange), bool(ticker.showTrendArrow), ticker.refreshIntervalSeconds, ticker.priority)
    .run();

  return ticker;
}

export async function createWestWallWeatherLocation(input: Partial<WestWallWeatherLocation>) {
  const db = getDbOrNull();
  const location: WestWallWeatherLocation = {
    id: input.id ?? createId("westwall-weather"),
    name: input.name?.trim() || "Dallas, TX",
    latitude: Number(input.latitude ?? 32.7767),
    longitude: Number(input.longitude ?? -96.797),
    isDefault: Boolean(input.isDefault)
  };

  if (!db) return location;

  await db
    .prepare("INSERT INTO westwall_weather_locations (id, device_id, name, latitude, longitude, is_default) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(location.id, DEFAULT_DEVICE_ID, location.name, location.latitude, location.longitude, bool(location.isDefault))
    .run();

  return location;
}

export async function queueWestWallCommand(command: string, payload: unknown = {}) {
  const db = getDbOrNull();
  const log: WestWallCommandLog = {
    id: createId("westwall-command"),
    command,
    status: "queued",
    createdAt: new Date().toISOString()
  };

  if (!db) return log;

  await db
    .prepare("INSERT INTO westwall_command_logs (id, device_id, command, payload, status) VALUES (?, ?, ?, ?, ?)")
    .bind(log.id, DEFAULT_DEVICE_ID, command, JSON.stringify(payload), log.status)
    .run();

  return log;
}

export async function listPendingWestWallCommands() {
  const db = getDbOrNull();

  if (!db) return mockWestWallCommands.filter((command) => command.status === "queued");

  await ensureWestWallSeeded();
  const { results = [] } = await db
    .prepare("SELECT id, command, payload, status, created_at FROM westwall_command_logs WHERE device_id = ? AND status = ? ORDER BY created_at ASC LIMIT 5")
    .bind(DEFAULT_DEVICE_ID, "queued")
    .all<CommandRow>();

  await db.prepare("UPDATE westwall_command_logs SET status = ? WHERE device_id = ? AND status = ?").bind("sent", DEFAULT_DEVICE_ID, "queued").run();
  return results.map(toCommand);
}

export async function acknowledgeWestWallCommand(id: string, status: WestWallCommandLog["status"] = "acknowledged") {
  const db = getDbOrNull();

  if (!db) return true;

  await db.prepare("UPDATE westwall_command_logs SET status = ? WHERE id = ? AND device_id = ?").bind(status, id, DEFAULT_DEVICE_ID).run();
  return true;
}

export async function createWestWallMessage(input: Partial<WestWallCustomMessage>) {
  const db = getDbOrNull();
  const message: WestWallCustomMessage = {
    id: input.id ?? createId("westwall-message"),
    title: input.title?.trim() || "Custom message",
    message: input.message?.trim() || "WestWall message",
    enabled: input.enabled ?? true,
    startsAt: input.startsAt ?? "",
    endsAt: input.endsAt ?? "",
    priority: Number(input.priority ?? 1)
  };

  if (!db) return message;

  await db
    .prepare("INSERT INTO westwall_custom_messages (id, device_id, title, message, enabled, starts_at, ends_at, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(message.id, DEFAULT_DEVICE_ID, message.title, message.message, bool(message.enabled), message.startsAt || null, message.endsAt || null, message.priority)
    .run();

  return message;
}

export async function recordWestWallCheckin(input: Partial<WestWallDeviceCheckin>) {
  const db = getDbOrNull();
  const checkin: WestWallDeviceCheckin = {
    id: createId("westwall-checkin"),
    firmwareVersion: input.firmwareVersion ?? "Unknown",
    wifiRssi: Number(input.wifiRssi ?? -99),
    uptimeSeconds: Number(input.uptimeSeconds ?? 0),
    freeMemoryBytes: Number(input.freeMemoryBytes ?? 0),
    currentScreen: input.currentScreen ?? "Unknown",
    createdAt: new Date().toISOString()
  };

  if (!db) return checkin;

  await db
    .prepare("INSERT INTO westwall_device_checkins (id, device_id, firmware_version, wifi_rssi, uptime_seconds, free_memory_bytes, current_screen) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(checkin.id, DEFAULT_DEVICE_ID, checkin.firmwareVersion, checkin.wifiRssi, checkin.uptimeSeconds, checkin.freeMemoryBytes, checkin.currentScreen)
    .run();

  await db
    .prepare("UPDATE westwall_devices SET status = ?, last_check_in = CURRENT_TIMESTAMP, firmware_version = ?, wifi_rssi = ?, active_screen = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind("online", checkin.firmwareVersion, checkin.wifiRssi, checkin.currentScreen, DEFAULT_DEVICE_ID)
    .run();

  return checkin;
}

export async function updateWestWallAppearance(input: Partial<WestWallAppearanceSettings>) {
  const db = getDbOrNull();
  const next = { ...mockWestWallAppearance, ...input };

  if (!db) return next;

  await ensureWestWallSeeded();
  await db
    .prepare(
      `UPDATE westwall_settings SET
        global_brightness = ?, auto_brightness = ?, day_brightness = ?, night_brightness = ?,
        sleep_start = ?, sleep_end = ?, color_theme = ?, font_size = ?, scroll_speed = ?,
        animation_style = ?, show_icons = ?, dot_matrix_preview = ?, units = ?, updated_at = CURRENT_TIMESTAMP
      WHERE device_id = ?`
    )
    .bind(next.globalBrightness, bool(next.autoBrightness), next.dayBrightness, next.nightBrightness, next.sleepStart, next.sleepEnd, next.colorTheme, next.fontSize, next.scrollSpeed, next.animationStyle, bool(next.showIcons), bool(next.dotMatrixPreview), next.units, DEFAULT_DEVICE_ID)
    .run();

  return next;
}

export async function updateWestWallRotation(screens: WestWallRotationScreen[]) {
  const db = getDbOrNull();

  if (!db) return screens;

  await ensureWestWallSeeded();

  for (const screen of screens) {
    await db
      .prepare(
        `UPDATE westwall_rotation_screens SET
          enabled = ?, duration_seconds = ?, priority = ?, preview = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND device_id = ?`
      )
      .bind(bool(screen.enabled), screen.durationSeconds, screen.priority, screen.preview, screen.id, DEFAULT_DEVICE_ID)
      .run();
  }

  return screens;
}

export async function buildWestWallDeviceConfig() {
  const data = await getWestWallDashboardData();

  return {
    device: {
      id: data.device.id,
      name: data.device.name,
      brightness: data.appearance.globalBrightness,
      sleep: { start: data.appearance.sleepStart, end: data.appearance.sleepEnd },
      units: data.appearance.units
    },
    rotation: data.rotation
      .filter((screen) => screen.enabled)
      .sort((a, b) => a.priority - b.priority)
      .map((screen) => ({
        key: screen.key,
        duration: screen.durationSeconds,
        priority: screen.priority
      })),
    appearance: {
      theme: data.appearance.colorTheme,
      fontSize: data.appearance.fontSize,
      scrollSpeed: data.appearance.scrollSpeed,
      animation: data.appearance.animationStyle,
      icons: data.appearance.showIcons
    }
  };
}

export async function buildWestWallCurrentPayload() {
  const data = await getWestWallDashboardData();
  const now = Date.now();
  const scheduledMessage = data.messages
    .filter((message) => message.enabled)
    .filter((message) => (!message.startsAt || Date.parse(message.startsAt) <= now) && (!message.endsAt || Date.parse(message.endsAt) >= now))
    .sort((a, b) => a.priority - b.priority)[0];
  const active = scheduledMessage ? data.rotation.find((screen) => screen.key === "custom-message") : data.rotation.find((screen) => screen.enabled) ?? data.rotation[0];

  return {
    screen: scheduledMessage ? "custom-message" : active?.key ?? "clock",
    label: scheduledMessage?.title ?? active?.label ?? "Clock",
    lines: [
      scheduledMessage?.message ?? active?.preview ?? "WestWall Ready",
      data.stocks.filter((stock) => stock.enabled).slice(0, 3).map((stock) => stock.symbol).join("  "),
      data.weatherLocations.find((location) => location.isDefault)?.name ?? "Dallas, TX"
    ].filter(Boolean),
    brightness: data.appearance.globalBrightness,
    generatedAt: new Date().toISOString()
  };
}
