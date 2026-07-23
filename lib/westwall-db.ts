import {
  mockWestWallAppearance,
  mockWestWallCommands,
  mockWestWallData,
  mockWestWallDevice,
  mockWestWallFlights,
  mockWestWallLocations,
  mockWestWallMessages,
  mockWestWallScenes,
  mockWestWallAlertRules,
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
  type WestWallWeatherLocation,
  type WestWallScene,
  type WestWallAlertRule
} from "@/data/westwall";
import { createId, getD1Database } from "@/lib/d1";
import { getAppleCalendarEvents, type CalendarEvent } from "@/lib/apple-calendar";
import {
  getNearbyAircraftFromProvider,
  getLiveFlightUpdatesFromProvider,
  getStockQuotesFromProvider,
  getWeatherFromProvider,
  getWestWallProviderHealth,
  setWestWallCalendarHealth,
  type NearbyAircraft,
  type StockQuote,
  type WeatherSnapshot
} from "@/lib/westwall-providers";

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
  source: WestWallUpcomingFlight["source"] | null;
  source_event_id: string | null;
  synced_at: string | null;
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
  display_width: number;
  operating_mode: WestWallAppearanceSettings["operatingMode"];
  alerts_enabled: number;
  button_controls: number;
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

type SceneRow = {
  id: string;
  name: string;
  enabled: number;
  layout: WestWallScene["layout"];
  left_screen: WestWallScene["leftScreen"];
  right_screen: WestWallScene["rightScreen"];
  operating_mode: WestWallScene["operatingMode"];
  starts_at: string | null;
  ends_at: string | null;
  days: string;
  priority: number;
};

type AlertRuleRow = {
  id: string;
  name: string;
  rule_type: WestWallAlertRule["type"];
  enabled: number;
  threshold_value: number;
  lead_minutes: number;
  quiet_start: string | null;
  quiet_end: string | null;
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
    confirmation: row.confirmation ?? "",
    source: row.source === "calendar" ? "calendar" : "manual",
    sourceEventId: row.source_event_id ?? "",
    syncedAt: row.synced_at ?? ""
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
    displayWidth: row.display_width === 256 ? 256 : 128,
    operatingMode: row.operating_mode ?? "Auto",
    alertsEnabled: Boolean(row.alerts_enabled),
    buttonControls: Boolean(row.button_controls),
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

function toScene(row: SceneRow): WestWallScene {
  let days: number[] = [0, 1, 2, 3, 4, 5, 6];
  try {
    const parsed = JSON.parse(row.days);
    if (Array.isArray(parsed)) days = parsed.map(Number).filter((day) => day >= 0 && day <= 6);
  } catch {
    // Use every day when an older row has malformed schedule data.
  }
  return {
    id: row.id,
    name: row.name,
    enabled: Boolean(row.enabled),
    layout: row.layout,
    leftScreen: row.left_screen,
    rightScreen: row.right_screen,
    operatingMode: row.operating_mode,
    startsAt: row.starts_at ?? "",
    endsAt: row.ends_at ?? "",
    days,
    priority: row.priority
  };
}

function toAlertRule(row: AlertRuleRow): WestWallAlertRule {
  return {
    id: row.id,
    name: row.name,
    type: row.rule_type,
    enabled: Boolean(row.enabled),
    threshold: row.threshold_value,
    leadMinutes: row.lead_minutes,
    quietStart: row.quiet_start ?? "",
    quietEnd: row.quiet_end ?? "",
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
      (id, device_id, display_width, operating_mode, alerts_enabled, button_controls, global_brightness, auto_brightness, day_brightness, night_brightness, sleep_start, sleep_end, color_theme, font_size, scroll_speed, animation_style, show_icons, dot_matrix_preview, units)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind("settings-westwall", DEFAULT_DEVICE_ID, mockWestWallAppearance.displayWidth, mockWestWallAppearance.operatingMode, bool(mockWestWallAppearance.alertsEnabled), bool(mockWestWallAppearance.buttonControls), mockWestWallAppearance.globalBrightness, bool(mockWestWallAppearance.autoBrightness), mockWestWallAppearance.dayBrightness, mockWestWallAppearance.nightBrightness, mockWestWallAppearance.sleepStart, mockWestWallAppearance.sleepEnd, mockWestWallAppearance.colorTheme, mockWestWallAppearance.fontSize, mockWestWallAppearance.scrollSpeed, mockWestWallAppearance.animationStyle, bool(mockWestWallAppearance.showIcons), bool(mockWestWallAppearance.dotMatrixPreview), mockWestWallAppearance.units)
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

  for (const scene of mockWestWallScenes) {
    await createWestWallScene(scene);
  }

  for (const rule of mockWestWallAlertRules) {
    await createWestWallAlertRule(rule);
  }
}

export async function getWestWallDashboardData(): Promise<WestWallDashboardData> {
  const db = getDbOrNull();

  if (!db) return mockWestWallData;

  try {
    await ensureWestWallSeeded();

    const deviceRow = await db.prepare("SELECT id, name, slug, status, last_check_in, active_screen, brightness, wifi_rssi, firmware_version FROM westwall_devices WHERE slug = ?").bind(DEFAULT_DEVICE_SLUG).first<DeviceRow>();
    const settingsRow = await db.prepare("SELECT display_width, operating_mode, alerts_enabled, button_controls, global_brightness, auto_brightness, day_brightness, night_brightness, sleep_start, sleep_end, color_theme, font_size, scroll_speed, animation_style, show_icons, dot_matrix_preview, units FROM westwall_settings WHERE device_id = ?").bind(DEFAULT_DEVICE_ID).first<SettingsRow>();
    const { results: rotationRows = [] } = await db.prepare("SELECT id, screen_key, label, enabled, duration_seconds, priority, preview FROM westwall_rotation_screens WHERE device_id = ? ORDER BY priority ASC").bind(DEFAULT_DEVICE_ID).all<RotationRow>();
    const { results: flightRows = [] } = await db.prepare("SELECT id, airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, gate, terminal, status, seat, confirmation, source, source_event_id, synced_at FROM westwall_upcoming_flights WHERE device_id = ? AND (departure_time IS NULL OR departure_time = '' OR departure_time >= datetime('now', '-12 hours')) ORDER BY departure_time ASC").bind(DEFAULT_DEVICE_ID).all<FlightRow>();
    const { results: locationRows = [] } = await db.prepare("SELECT id, name, latitude, longitude, radius_miles, altitude_filter, airline_filter, aircraft_type_filter, refresh_interval_seconds, data_source, is_default FROM westwall_saved_locations WHERE device_id = ? ORDER BY is_default DESC, name ASC").bind(DEFAULT_DEVICE_ID).all<LocationRow>();
    const { results: tickerRows = [] } = await db.prepare("SELECT id, symbol, label, enabled, asset_type, show_price, show_change, show_percent_change, show_trend_arrow, refresh_interval_seconds, priority FROM westwall_stock_tickers WHERE device_id = ? ORDER BY priority ASC").bind(DEFAULT_DEVICE_ID).all<TickerRow>();
    const { results: weatherRows = [] } = await db.prepare("SELECT id, name, latitude, longitude, is_default FROM westwall_weather_locations WHERE device_id = ? ORDER BY is_default DESC, name ASC").bind(DEFAULT_DEVICE_ID).all<WeatherLocationRow>();
    const { results: commandRows = [] } = await db.prepare("SELECT id, command, payload, status, created_at FROM westwall_command_logs WHERE device_id = ? ORDER BY created_at DESC LIMIT 10").bind(DEFAULT_DEVICE_ID).all<CommandRow>();
    const { results: checkinRows = [] } = await db.prepare("SELECT id, firmware_version, wifi_rssi, uptime_seconds, free_memory_bytes, current_screen, created_at FROM westwall_device_checkins WHERE device_id = ? ORDER BY created_at DESC LIMIT 10").bind(DEFAULT_DEVICE_ID).all<CheckinRow>();
    const { results: messageRows = [] } = await db.prepare("SELECT id, title, message, enabled, starts_at, ends_at, priority FROM westwall_custom_messages WHERE device_id = ? ORDER BY priority ASC").bind(DEFAULT_DEVICE_ID).all<MessageRow>();
    const { results: sceneRows = [] } = await db.prepare("SELECT id, name, enabled, layout, left_screen, right_screen, operating_mode, starts_at, ends_at, days, priority FROM westwall_scenes WHERE device_id = ? ORDER BY priority ASC").bind(DEFAULT_DEVICE_ID).all<SceneRow>();
    const { results: alertRuleRows = [] } = await db.prepare("SELECT id, name, rule_type, enabled, threshold_value, lead_minutes, quiet_start, quiet_end, priority FROM westwall_alert_rules WHERE device_id = ? ORDER BY priority ASC").bind(DEFAULT_DEVICE_ID).all<AlertRuleRow>();

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
      messages: messageRows.map(toMessage),
      scenes: sceneRows.length ? sceneRows.map(toScene) : mockWestWallScenes,
      alertRules: alertRuleRows.length ? alertRuleRows.map(toAlertRule) : mockWestWallAlertRules
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
    confirmation: input.confirmation ?? "",
    source: input.source ?? "manual",
    sourceEventId: input.sourceEventId ?? "",
    syncedAt: input.syncedAt ?? ""
  };

  if (!db) return flight;

  await db
    .prepare("INSERT INTO westwall_upcoming_flights (id, device_id, airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, gate, terminal, status, seat, confirmation, source, source_event_id, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(flight.id, DEFAULT_DEVICE_ID, flight.airline, flight.flightNumber, flight.departureAirport, flight.arrivalAirport, flight.departureTime, flight.arrivalTime, flight.gate, flight.terminal, flight.status, flight.seat, flight.confirmation, flight.source, flight.sourceEventId || null, flight.syncedAt || null)
    .run();

  return flight;
}

export async function upsertCalendarWestWallFlight(flight: WestWallUpcomingFlight) {
  const db = getDbOrNull();
  if (!db) return flight;

  await db.prepare(
    `INSERT INTO westwall_upcoming_flights
      (id, device_id, airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, gate, terminal, status, seat, confirmation, source, source_event_id, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'calendar', ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      airline = excluded.airline,
      flight_number = excluded.flight_number,
      departure_airport = excluded.departure_airport,
      arrival_airport = excluded.arrival_airport,
      departure_time = excluded.departure_time,
      arrival_time = excluded.arrival_time,
      gate = excluded.gate,
      terminal = excluded.terminal,
      status = excluded.status,
      seat = excluded.seat,
      confirmation = excluded.confirmation,
      source = 'calendar',
      source_event_id = excluded.source_event_id,
      synced_at = excluded.synced_at,
      updated_at = CURRENT_TIMESTAMP`
  ).bind(
    flight.id,
    DEFAULT_DEVICE_ID,
    flight.airline,
    flight.flightNumber,
    flight.departureAirport,
    flight.arrivalAirport,
    flight.departureTime,
    flight.arrivalTime,
    flight.gate,
    flight.terminal,
    flight.status,
    flight.seat,
    flight.confirmation,
    flight.sourceEventId,
    flight.syncedAt
  ).run();

  return flight;
}

export async function pruneCalendarWestWallFlights(activeEventIds: string[]) {
  const db = getDbOrNull();
  if (!db) return;

  const { results = [] } = await db.prepare(
    "SELECT id, source_event_id FROM westwall_upcoming_flights WHERE device_id = ? AND source = 'calendar'"
  ).bind(DEFAULT_DEVICE_ID).all<{ id: string; source_event_id: string | null }>();

  const active = new Set(activeEventIds);
  for (const row of results) {
    if (!row.source_event_id || !active.has(row.source_event_id)) {
      await db.prepare("DELETE FROM westwall_upcoming_flights WHERE id = ? AND device_id = ?").bind(row.id, DEFAULT_DEVICE_ID).run();
    }
  }
}

export async function deleteWestWallFlight(id: string) {
  const db = getDbOrNull();
  if (db) await db.prepare("DELETE FROM westwall_upcoming_flights WHERE id = ? AND device_id = ?").bind(id, DEFAULT_DEVICE_ID).run();
  return true;
}

export async function createWestWallLocation(input: Partial<WestWallSavedLocation>) {
  const db = getDbOrNull();
  const location: WestWallSavedLocation = {
    id: input.id ?? createId("westwall-location"),
    name: input.name?.trim() || "Saved location",
    latitude: Number(input.latitude ?? 33.143288),
    longitude: Number(input.longitude ?? -97.068141),
    radiusMiles: Number(input.radiusMiles ?? 10),
    altitudeFilter: input.altitudeFilter ?? "All",
    airlineFilter: input.airlineFilter ?? "All",
    aircraftTypeFilter: input.aircraftTypeFilter ?? "All",
    refreshIntervalSeconds: Number(input.refreshIntervalSeconds ?? 10),
    dataSource: input.dataSource ?? "ADSB.lol",
    isDefault: Boolean(input.isDefault)
  };

  if (!db) return location;

  await db
    .prepare("INSERT INTO westwall_saved_locations (id, device_id, name, latitude, longitude, radius_miles, altitude_filter, airline_filter, aircraft_type_filter, refresh_interval_seconds, data_source, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(location.id, DEFAULT_DEVICE_ID, location.name, location.latitude, location.longitude, location.radiusMiles, location.altitudeFilter, location.airlineFilter, location.aircraftTypeFilter, location.refreshIntervalSeconds, location.dataSource, bool(location.isDefault))
    .run();

  return location;
}

export async function deleteWestWallLocation(id: string) {
  const db = getDbOrNull();
  if (db) await db.prepare("DELETE FROM westwall_saved_locations WHERE id = ? AND device_id = ?").bind(id, DEFAULT_DEVICE_ID).run();
  return true;
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

export async function deleteWestWallTicker(id: string) {
  const db = getDbOrNull();
  if (db) await db.prepare("DELETE FROM westwall_stock_tickers WHERE id = ? AND device_id = ?").bind(id, DEFAULT_DEVICE_ID).run();
  return true;
}

export async function createWestWallWeatherLocation(input: Partial<WestWallWeatherLocation>) {
  const db = getDbOrNull();
  const location: WestWallWeatherLocation = {
    id: input.id ?? createId("westwall-weather"),
    name: input.name?.trim() || "Corinth, TX",
    latitude: Number(input.latitude ?? 33.143288),
    longitude: Number(input.longitude ?? -97.068141),
    isDefault: Boolean(input.isDefault)
  };

  if (!db) return location;

  await db
    .prepare("INSERT INTO westwall_weather_locations (id, device_id, name, latitude, longitude, is_default) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(location.id, DEFAULT_DEVICE_ID, location.name, location.latitude, location.longitude, bool(location.isDefault))
    .run();

  return location;
}

export async function deleteWestWallWeatherLocation(id: string) {
  const db = getDbOrNull();
  if (db) await db.prepare("DELETE FROM westwall_weather_locations WHERE id = ? AND device_id = ?").bind(id, DEFAULT_DEVICE_ID).run();
  return true;
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

export async function updateWestWallMessage(id: string, input: Partial<WestWallCustomMessage>) {
  const db = getDbOrNull();
  if (!db) return null;

  const current = await db.prepare("SELECT id, title, message, enabled, starts_at, ends_at, priority FROM westwall_custom_messages WHERE id = ? AND device_id = ?").bind(id, DEFAULT_DEVICE_ID).first<MessageRow>();
  if (!current) return null;
  const message = { ...toMessage(current), ...input, id };

  await db.prepare(
    "UPDATE westwall_custom_messages SET title = ?, message = ?, enabled = ?, starts_at = ?, ends_at = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND device_id = ?"
  ).bind(message.title, message.message, bool(message.enabled), message.startsAt || null, message.endsAt || null, message.priority, id, DEFAULT_DEVICE_ID).run();
  return message;
}

export async function deleteWestWallMessage(id: string) {
  const db = getDbOrNull();
  if (db) await db.prepare("DELETE FROM westwall_custom_messages WHERE id = ? AND device_id = ?").bind(id, DEFAULT_DEVICE_ID).run();
  return true;
}

export async function createWestWallScene(input: Partial<WestWallScene>) {
  const db = getDbOrNull();
  const scene: WestWallScene = {
    id: input.id ?? createId("westwall-scene"),
    name: input.name?.trim() || "New scene",
    enabled: input.enabled ?? true,
    layout: input.layout ?? "panoramic",
    leftScreen: input.leftScreen ?? "upcoming-flights",
    rightScreen: input.rightScreen ?? "weather",
    operatingMode: input.operatingMode ?? "Any",
    startsAt: input.startsAt ?? "",
    endsAt: input.endsAt ?? "",
    days: input.days?.map(Number) ?? [0, 1, 2, 3, 4, 5, 6],
    priority: Number(input.priority ?? 10)
  };
  if (db) {
    await db.prepare("INSERT INTO westwall_scenes (id, device_id, name, enabled, layout, left_screen, right_screen, operating_mode, starts_at, ends_at, days, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(scene.id, DEFAULT_DEVICE_ID, scene.name, bool(scene.enabled), scene.layout, scene.leftScreen, scene.rightScreen, scene.operatingMode, scene.startsAt || null, scene.endsAt || null, JSON.stringify(scene.days), scene.priority).run();
  }
  return scene;
}

export async function updateWestWallScene(id: string, input: Partial<WestWallScene>) {
  const db = getDbOrNull();
  if (!db) return null;
  const current = await db.prepare("SELECT id, name, enabled, layout, left_screen, right_screen, operating_mode, starts_at, ends_at, days, priority FROM westwall_scenes WHERE id = ? AND device_id = ?").bind(id, DEFAULT_DEVICE_ID).first<SceneRow>();
  if (!current) return null;
  const scene = { ...toScene(current), ...input, id };
  await db.prepare("UPDATE westwall_scenes SET name = ?, enabled = ?, layout = ?, left_screen = ?, right_screen = ?, operating_mode = ?, starts_at = ?, ends_at = ?, days = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND device_id = ?")
    .bind(scene.name, bool(scene.enabled), scene.layout, scene.leftScreen, scene.rightScreen, scene.operatingMode, scene.startsAt || null, scene.endsAt || null, JSON.stringify(scene.days), Number(scene.priority), id, DEFAULT_DEVICE_ID).run();
  return scene;
}

export async function deleteWestWallScene(id: string) {
  const db = getDbOrNull();
  if (db) await db.prepare("DELETE FROM westwall_scenes WHERE id = ? AND device_id = ?").bind(id, DEFAULT_DEVICE_ID).run();
  return true;
}

export async function createWestWallAlertRule(input: Partial<WestWallAlertRule>) {
  const db = getDbOrNull();
  const rule: WestWallAlertRule = {
    id: input.id ?? createId("westwall-alert"),
    name: input.name?.trim() || "New alert",
    type: input.type ?? "weather-severe",
    enabled: input.enabled ?? true,
    threshold: Number(input.threshold ?? 0),
    leadMinutes: Number(input.leadMinutes ?? 0),
    quietStart: input.quietStart ?? "",
    quietEnd: input.quietEnd ?? "",
    priority: Number(input.priority ?? 10)
  };
  if (db) {
    await db.prepare("INSERT INTO westwall_alert_rules (id, device_id, name, rule_type, enabled, threshold_value, lead_minutes, quiet_start, quiet_end, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(rule.id, DEFAULT_DEVICE_ID, rule.name, rule.type, bool(rule.enabled), rule.threshold, rule.leadMinutes, rule.quietStart || null, rule.quietEnd || null, rule.priority).run();
  }
  return rule;
}

export async function updateWestWallAlertRule(id: string, input: Partial<WestWallAlertRule>) {
  const db = getDbOrNull();
  if (!db) return null;
  const current = await db.prepare("SELECT id, name, rule_type, enabled, threshold_value, lead_minutes, quiet_start, quiet_end, priority FROM westwall_alert_rules WHERE id = ? AND device_id = ?").bind(id, DEFAULT_DEVICE_ID).first<AlertRuleRow>();
  if (!current) return null;
  const rule = { ...toAlertRule(current), ...input, id };
  await db.prepare("UPDATE westwall_alert_rules SET name = ?, rule_type = ?, enabled = ?, threshold_value = ?, lead_minutes = ?, quiet_start = ?, quiet_end = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND device_id = ?")
    .bind(rule.name, rule.type, bool(rule.enabled), Number(rule.threshold), Number(rule.leadMinutes), rule.quietStart || null, rule.quietEnd || null, Number(rule.priority), id, DEFAULT_DEVICE_ID).run();
  return rule;
}

export async function deleteWestWallAlertRule(id: string) {
  const db = getDbOrNull();
  if (db) await db.prepare("DELETE FROM westwall_alert_rules WHERE id = ? AND device_id = ?").bind(id, DEFAULT_DEVICE_ID).run();
  return true;
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
        display_width = ?, operating_mode = ?, alerts_enabled = ?, button_controls = ?,
        global_brightness = ?, auto_brightness = ?, day_brightness = ?, night_brightness = ?,
        sleep_start = ?, sleep_end = ?, color_theme = ?, font_size = ?, scroll_speed = ?,
        animation_style = ?, show_icons = ?, dot_matrix_preview = ?, units = ?, updated_at = CURRENT_TIMESTAMP
      WHERE device_id = ?`
    )
    .bind(next.displayWidth === 256 ? 256 : 128, next.operatingMode, bool(next.alertsEnabled), bool(next.buttonControls), next.globalBrightness, bool(next.autoBrightness), next.dayBrightness, next.nightBrightness, next.sleepStart, next.sleepEnd, next.colorTheme, next.fontSize, next.scrollSpeed, next.animationStyle, bool(next.showIcons), bool(next.dotMatrixPreview), next.units, DEFAULT_DEVICE_ID)
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
      displayWidth: data.appearance.displayWidth,
      operatingMode: data.appearance.operatingMode,
      alertsEnabled: data.appearance.alertsEnabled,
      buttonControls: data.appearance.buttonControls,
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
  let calendarEvents: CalendarEvent[] = [];
  try {
    calendarEvents = (await getAppleCalendarEvents()).events;
    setWestWallCalendarHealth("live", `${calendarEvents.length} upcoming event${calendarEvents.length === 1 ? "" : "s"}`);
  } catch {
    setWestWallCalendarHealth("unavailable", "Calendar feed could not be reached");
  }

  const upcomingFlights = data.flights
    .filter((flight) => !flight.departureTime || Date.parse(flight.departureTime) >= now - 12 * 60 * 60 * 1000)
    .sort((a, b) => Date.parse(a.departureTime || "9999-12-31") - Date.parse(b.departureTime || "9999-12-31"));
  const nextFlight = upcomingFlights[0];
  const defaultWeather = data.weatherLocations.find((location) => location.isDefault) ?? data.weatherLocations[0];
  const defaultAircraftLocation = data.locations.find((location) => location.isDefault) ?? data.locations[0];
  const enabledStocks = data.stocks.filter((stock) => stock.enabled).sort((a, b) => a.priority - b.priority);
  let weather: WeatherSnapshot | null = null;
  let nearbyAircraft: NearbyAircraft[] = [];
  let stockQuotes: StockQuote[] = [];
  const [weatherResult, aircraftResult, stockResult, flightResult] = await Promise.allSettled([
    defaultWeather ? getWeatherFromProvider(defaultWeather, data.appearance.units) : Promise.resolve(null),
    defaultAircraftLocation ? getNearbyAircraftFromProvider(defaultAircraftLocation) : Promise.resolve([]),
    enabledStocks.length ? getStockQuotesFromProvider(enabledStocks) : Promise.resolve([]),
    upcomingFlights.length ? getLiveFlightUpdatesFromProvider(upcomingFlights) : Promise.resolve(new Map())
  ]);
  if (weatherResult.status === "fulfilled") weather = weatherResult.value;
  if (aircraftResult.status === "fulfilled") nearbyAircraft = aircraftResult.value;
  if (stockResult.status === "fulfilled") stockQuotes = stockResult.value;
  if (flightResult.status === "fulfilled") {
    for (const flight of upcomingFlights) {
      const update = flightResult.value.get(flight.id);
      if (!update) continue;
      flight.status = update.status;
      flight.gate = update.gate;
      flight.terminal = update.terminal;
      flight.departureTime = update.estimatedDeparture || flight.departureTime;
      flight.arrivalTime = update.estimatedArrival || flight.arrivalTime;
    }
  }
  const chicagoNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const hour = chicagoNow.getHours();
  const timeFormatter = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "2-digit" });
  const dateFormatter = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const shortTime = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "numeric", minute: "2-digit" });

  function airlineSymbol(flight: WestWallUpcomingFlight | undefined) {
    if (!flight) return "";
    const fromNumber = flight.flightNumber.toUpperCase().match(/^([A-Z0-9]{2,3})\s*\d/)?.[1];
    if (fromNumber) return fromNumber;
    const knownAirlines: Record<string, string> = {
      american: "AA", southwest: "WN", united: "UA", delta: "DL", alaska: "AS",
      jetblue: "B6", spirit: "NK", frontier: "F9", aircanada: "AC", british: "BA"
    };
    const normalized = flight.airline.toLowerCase().replace(/[^a-z]/g, "");
    return Object.entries(knownAirlines).find(([name]) => normalized.includes(name))?.[1] ?? flight.airline.slice(0, 2).toUpperCase();
  }

  function airlineIcon(code: string) {
    const normalized = code.toLowerCase();
    return ["aa", "wn", "ua", "dl", "as", "b6", "nk", "f9", "ac", "ba"].includes(normalized)
      ? `airline-${normalized}`
      : "aircraft";
  }

  function price(value: number) {
    return value >= 1000 ? value.toFixed(0) : value.toFixed(2);
  }

  function compactFlight(flight: WestWallUpcomingFlight) {
    const time = flight.departureTime ? shortTime.format(new Date(flight.departureTime)).replace(" ", "") : "TBD";
    const gate = flight.gate ? ` G${flight.gate}` : "";
    return `${flight.flightNumber} ${flight.departureAirport}>${flight.arrivalAirport} ${time} ${flight.status}${gate}`;
  }

  const minutesToFlight = nextFlight?.departureTime ? Math.round((Date.parse(nextFlight.departureTime) - now) / 60_000) : Number.POSITIVE_INFINITY;
  let resolvedMode: WestWallAppearanceSettings["operatingMode"] = data.appearance.operatingMode;
  if (resolvedMode === "Auto") {
    if (minutesToFlight >= 0 && minutesToFlight <= 24 * 60) resolvedMode = "Travel";
    else if (hour < 6 || hour >= 23) resolvedMode = "Night";
    else if (hour < 9) resolvedMode = "Morning";
    else if (hour < 17) resolvedMode = "Workday";
    else resolvedMode = "Evening";
  }

  const modeOrder: Record<Exclude<WestWallAppearanceSettings["operatingMode"], "Auto">, WestWallRotationScreen["key"][]> = {
    Morning: ["weather", "clock", "calendar-preview", "stocks", "nearby-aircraft", "upcoming-flights", "custom-message", "home-status"],
    Workday: ["upcoming-flights", "stocks", "weather", "calendar-preview", "nearby-aircraft", "clock", "custom-message", "home-status"],
    Evening: ["nearby-aircraft", "weather", "calendar-preview", "clock", "upcoming-flights", "stocks", "custom-message", "home-status"],
    Travel: ["upcoming-flights", "weather", "clock", "calendar-preview", "nearby-aircraft", "stocks", "custom-message", "home-status"],
    Guest: ["clock", "weather", "custom-message", "home-status", "calendar-preview", "nearby-aircraft", "stocks", "upcoming-flights"],
    Night: ["clock", "weather", "upcoming-flights", "nearby-aircraft", "calendar-preview", "stocks", "custom-message", "home-status"]
  };

  function displayLabel(screen: WestWallRotationScreen) {
    const labels: Partial<Record<WestWallRotationScreen["key"], string>> = {
      "upcoming-flights": "UPCOMING FLIGHT",
      "nearby-aircraft": "OVER CORINTH",
      stocks: "LIVE MARKET",
      weather: "CORINTH WEATHER",
      clock: "CLOCK",
      "calendar-preview": "CALENDAR",
      "custom-message": "MESSAGE",
      "home-status": "HOME"
    };
    return labels[screen.key] ?? screen.label;
  }

  function screenContent(screen: WestWallRotationScreen) {
    switch (screen.key) {
      case "upcoming-flights": {
        const flightLines = data.appearance.displayWidth === 256
          ? upcomingFlights.slice(0, 4).map(compactFlight)
          : nextFlight ? [`${nextFlight.flightNumber} ${nextFlight.status}`, `${nextFlight.departureAirport} > ${nextFlight.arrivalAirport}`, `${nextFlight.departureTime ? dateFormatter.format(new Date(nextFlight.departureTime)) : "Time TBD"}${nextFlight.gate ? ` GATE ${nextFlight.gate}` : ""}`] : [];
        return { icon: airlineIcon(airlineSymbol(nextFlight)), symbol: airlineSymbol(nextFlight), lines: flightLines.length ? flightLines : ["NO UPCOMING FLIGHTS", "CALENDAR SYNC ON", "ADD TRAVEL IN MATTHEWOS"] };
      }
      case "nearby-aircraft":
        if (nearbyAircraft[0]) {
          const aircraft = nearbyAircraft[0];
          const aircraftLines = data.appearance.displayWidth === 256
            ? nearbyAircraft.slice(0, 4).map((item) => `${item.callsign} ${item.distanceMiles.toFixed(1)}MI ${item.bearing} ${item.altitudeFeet.toLocaleString("en-US")}FT ${item.groundSpeedKnots}KT ${item.aircraftType}`)
            : [`${aircraft.callsign} ${aircraft.aircraftType}`, `${aircraft.distanceMiles.toFixed(1)} MI ${aircraft.bearing} OF CORINTH`, `${aircraft.altitudeFeet.toLocaleString("en-US")} FT ${aircraft.groundSpeedKnots} KT`];
          return {
            icon: airlineIcon(aircraft.carrierCode),
            symbol: aircraft.carrierCode || aircraft.registration.slice(0, 3),
            lines: aircraftLines
          };
        }
        return { icon: "aircraft", symbol: "", lines: ["SKY CLEAR", "NO AIRCRAFT WITHIN", `${defaultAircraftLocation?.radiusMiles ?? 10} MI OF CORINTH`] };
      case "stocks": {
        const lines = stockQuotes.flatMap((quote) => {
          const sign = quote.change >= 0 ? "+" : "";
          return data.appearance.displayWidth === 256
            ? [`${quote.symbol} $${price(quote.price)} ${sign}${quote.change.toFixed(2)} ${sign}${quote.percentChange.toFixed(2)}% ${quote.trend} ${quote.marketStatus.toUpperCase()}`]
            : [`${quote.symbol} $${price(quote.price)}`, `${sign}${quote.change.toFixed(2)} ${sign}${quote.percentChange.toFixed(2)}% ${quote.trend}`];
        });
        return { icon: "chart", symbol: stockQuotes[0]?.symbol?.slice(0, 3) ?? "", lines: lines.length ? lines : enabledStocks.length ? ["LIVE QUOTES UNAVAILABLE", enabledStocks.map((stock) => stock.symbol).join("  "), "TRYING AGAIN SOON"] : ["NO TICKERS", "ADD SYMBOLS IN", "MATTHEWOS"] };
      }
      case "weather": {
        const unit = data.appearance.units === "imperial" ? "F" : "C";
        const forecast = weather?.hourly.slice(0, 3).map((item) => `${shortTime.format(new Date(item.time)).replace(" ", "")} ${item.temperature}${unit} R${item.rainChance}%`) ?? [];
        const lines = weather ? (data.appearance.displayWidth === 256
          ? [`${weather.location} ${weather.temperature}${unit} ${weather.conditions} FEELS ${weather.feelsLike}${unit}`, `H${weather.high} L${weather.low} RAIN ${weather.rainChance}% WIND ${weather.wind} AQI ${weather.aqi}`, forecast.join("  "), `SUNRISE ${weather.sunrise.slice(11, 16)}  SUNSET ${weather.sunset.slice(11, 16)}`]
          : [weather.location, `${weather.temperature}${unit} ${weather.conditions}`, `H${weather.high} L${weather.low} R${weather.rainChance}% AQI${weather.aqi}`])
          : [defaultWeather?.name ?? "Corinth, TX", "WEATHER UNAVAILABLE", "TRYING AGAIN SOON"];
        return { icon: weather?.icon ?? "cloud", symbol: weather ? String(weather.temperature) : "", lines };
      }
      case "clock":
        return { icon: "clock", symbol: "", lines: [timeFormatter.format(new Date()), "MATTHEWOS", data.device.status.toUpperCase()] };
      case "calendar-preview": {
        const event = calendarEvents[0];
        return { icon: "calendar", symbol: "", lines: event ? ["NEXT EVENT", event.title, dateFormatter.format(new Date(event.startsAt))] : ["CALENDAR CLEAR", "NO UPCOMING EVENTS", timeFormatter.format(new Date())] };
      }
      case "custom-message":
        return { icon: "message", symbol: "", lines: scheduledMessage ? [scheduledMessage.title, scheduledMessage.message, "MESSAGE FROM MATTHEWOS"] : [screen.label, screen.preview || "NO ACTIVE MESSAGE"] };
      case "home-status":
        return { icon: "home", symbol: "", lines: [screen.label, screen.preview || "HOME SYSTEMS NOMINAL", timeFormatter.format(new Date())] };
      default:
        return { icon: "message", symbol: "", lines: [screen.label, screen.preview || "WESTWALL READY"] };
    }
  }

  const profileOrder = modeOrder[resolvedMode as Exclude<typeof resolvedMode, "Auto">] ?? modeOrder.Workday;
  const enabledScreens = data.rotation.filter((screen) => screen.enabled).sort((a, b) => profileOrder.indexOf(a.key) - profileOrder.indexOf(b.key));
  const basePlaylist = (scheduledMessage
    ? [data.rotation.find((screen) => screen.key === "custom-message") ?? { id: "scheduled", key: "custom-message" as const, label: scheduledMessage.title, enabled: true, durationSeconds: 30, priority: 0, preview: scheduledMessage.message }]
    : enabledScreens
  ).map((screen) => {
    const content = screenContent(screen);
    return {
      screen: screen.key,
      label: scheduledMessage ? "MESSAGE" : displayLabel(screen),
      lines: content.lines,
      icon: data.appearance.showIcons ? content.icon : "none",
      symbol: data.appearance.showIcons ? content.symbol : "",
      duration: Math.max(5, screen.durationSeconds)
    };
  });

  const localTime = `${String(hour).padStart(2, "0")}:${String(chicagoNow.getMinutes()).padStart(2, "0")}`;
  function isTimeActive(startsAt: string, endsAt: string) {
    if (!startsAt && !endsAt) return true;
    if (startsAt && endsAt && startsAt > endsAt) return localTime >= startsAt || localTime < endsAt;
    return (!startsAt || localTime >= startsAt) && (!endsAt || localTime < endsAt);
  }
  const activeScene = data.scenes
    .filter((scene) => scene.enabled)
    .filter((scene) => scene.operatingMode === "Any" || scene.operatingMode === resolvedMode)
    .filter((scene) => scene.days.includes(chicagoNow.getDay()))
    .filter((scene) => isTimeActive(scene.startsAt, scene.endsAt))
    .sort((a, b) => a.priority - b.priority)[0];

  function itemForScreen(key: WestWallRotationScreen["key"]) {
    const screen = data.rotation.find((candidate) => candidate.key === key) ?? { id: key, key, label: key, enabled: true, durationSeconds: 15, priority: 99, preview: "" };
    const content = screenContent(screen);
    return { screen: key, label: displayLabel(screen), lines: content.lines, icon: content.icon, symbol: content.symbol, duration: Math.max(5, screen.durationSeconds) };
  }

  type PayloadItem = Omit<(typeof basePlaylist)[number], "screen"> & { screen: string; layout?: string; scene?: string; zones?: Array<{ screen: string; label: string; lines: string[]; icon: string; symbol: string }> };
  let playlist: PayloadItem[] = basePlaylist;
  if (!scheduledMessage && data.appearance.displayWidth === 256 && activeScene && activeScene.layout !== "panoramic") {
    const left = itemForScreen(activeScene.leftScreen);
    const right = itemForScreen(activeScene.rightScreen);
    const zone = (item: typeof left) => ({ screen: item.screen, label: item.label, lines: item.lines.slice(0, 4), icon: item.icon, symbol: item.symbol });
    if (activeScene.layout === "dual") {
      playlist = [{ ...left, screen: `scene-${activeScene.id}`, label: activeScene.name, layout: "dual", scene: activeScene.name, zones: [zone(left), zone(right)], duration: Math.max(left.duration, right.duration) }];
    } else {
      const rotating = basePlaylist.filter((item) => item.screen !== left.screen);
      playlist = (rotating.length ? rotating : [right]).map((item) => ({ ...item, layout: "dual", scene: activeScene.name, zones: [zone(left), zone(item)] }));
    }
  }

  const active = playlist[0] ?? { screen: "clock", label: "Clock", lines: [timeFormatter.format(new Date())], icon: "clock", symbol: "", duration: 30 };

  let takeover: { id: string; label: string; lines: string[]; icon: string; symbol: string; duration: number } | null = null;
  function ruleIsQuiet(rule: WestWallAlertRule) {
    return !isTimeActive(rule.quietEnd, rule.quietStart);
  }
  if (data.appearance.alertsEnabled) {
    for (const rule of data.alertRules.filter((candidate) => candidate.enabled && !ruleIsQuiet(candidate)).sort((a, b) => a.priority - b.priority)) {
      if (rule.type === "weather-severe" && weather?.severeAlert) {
        takeover = { id: `weather:${weather.alertHeadline || weather.conditions}`, label: rule.name.toUpperCase(), lines: [weather.alertHeadline || weather.conditions, `${weather.temperature}${data.appearance.units === "imperial" ? "F" : "C"} ${weather.wind}`, "PRESS A BUTTON TO DISMISS"], icon: "storm", symbol: "!", duration: 30 };
      } else if (rule.type === "weather-rain" && weather && weather.rainChance >= rule.threshold) {
        takeover = { id: `rain:${weather.rainChance}`, label: rule.name.toUpperCase(), lines: [`RAIN CHANCE ${weather.rainChance}%`, weather.conditions, `WIND ${weather.wind}`], icon: "rain", symbol: `${weather.rainChance}`, duration: 20 };
      } else if (rule.type === "flight-soon" && nextFlight && minutesToFlight >= 0 && minutesToFlight <= Math.max(1, rule.leadMinutes)) {
        takeover = { id: `flight:${nextFlight.id}:${nextFlight.departureTime}`, label: rule.name.toUpperCase(), lines: [compactFlight(nextFlight), `DEPARTS IN ${minutesToFlight} MIN`, nextFlight.gate ? `GATE ${nextFlight.gate} ${nextFlight.terminal ? `TERMINAL ${nextFlight.terminal}` : ""}` : "CHECK AIRLINE FOR GATE"], icon: airlineIcon(airlineSymbol(nextFlight)), symbol: airlineSymbol(nextFlight), duration: 25 };
      } else if (rule.type === "aircraft-close" && nearbyAircraft[0] && nearbyAircraft[0].distanceMiles <= Math.max(0.1, rule.threshold)) {
        const aircraft = nearbyAircraft[0];
        takeover = { id: `aircraft:${aircraft.callsign}:${Math.round(aircraft.distanceMiles)}`, label: rule.name.toUpperCase(), lines: [`${aircraft.callsign} ${aircraft.aircraftType}`, `${aircraft.distanceMiles.toFixed(1)} MI ${aircraft.bearing}`, `${aircraft.altitudeFeet.toLocaleString("en-US")} FT ${aircraft.groundSpeedKnots} KT`], icon: airlineIcon(aircraft.carrierCode), symbol: aircraft.carrierCode, duration: 18 };
      } else if (rule.type === "stock-move") {
        const mover = stockQuotes.find((quote) => Math.abs(quote.percentChange) >= Math.max(0.1, rule.threshold));
        if (mover) takeover = { id: `stock:${mover.symbol}:${mover.percentChange.toFixed(1)}`, label: rule.name.toUpperCase(), lines: [`${mover.symbol} $${price(mover.price)}`, `${mover.percentChange >= 0 ? "+" : ""}${mover.percentChange.toFixed(2)}% TODAY`, mover.trend], icon: "chart", symbol: mover.symbol.slice(0, 3), duration: 18 };
      }
      if (takeover) break;
    }
  }

  const feedHealth = getWestWallProviderHealth();
  const brightness = resolvedMode === "Night" ? data.appearance.nightBrightness : data.appearance.autoBrightness ? data.appearance.dayBrightness : data.appearance.globalBrightness;

  return {
    screen: active.screen,
    label: active.label,
    lines: active.lines.filter(Boolean),
    icon: active.icon,
    symbol: active.symbol,
    playlist,
    layout: active.layout ?? "panoramic",
    scene: active.scene ?? activeScene?.name ?? "Automatic rotation",
    zones: active.zones ?? [],
    takeover,
    displayWidth: data.appearance.displayWidth,
    configuredMode: data.appearance.operatingMode,
    resolvedMode,
    buttonControls: data.appearance.buttonControls,
    feedHealth,
    brightness,
    generatedAt: new Date().toISOString()
  };
}
