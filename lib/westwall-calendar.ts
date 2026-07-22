import { getAppleCalendarEvents, type CalendarEvent } from "@/lib/apple-calendar";
import { pruneCalendarWestWallFlights, upsertCalendarWestWallFlight } from "@/lib/westwall-db";
import type { WestWallUpcomingFlight } from "@/data/westwall";

const AIRLINES: Record<string, string> = {
  AA: "American Airlines",
  AS: "Alaska Airlines",
  B6: "JetBlue",
  DL: "Delta Air Lines",
  F9: "Frontier Airlines",
  NK: "Spirit Airlines",
  UA: "United Airlines",
  WN: "Southwest Airlines"
};

const AIRLINE_NAMES: Array<[RegExp, string]> = [
  [/american(?: airlines)?/i, "AA"],
  [/southwest/i, "WN"],
  [/united(?: airlines)?/i, "UA"],
  [/delta(?: air lines)?/i, "DL"],
  [/alaska(?: airlines)?/i, "AS"],
  [/jetblue/i, "B6"],
  [/spirit/i, "NK"],
  [/frontier/i, "F9"]
];

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function findFlightNumber(text: string) {
  const direct = text.toUpperCase().match(/\b([A-Z][A-Z0-9])\s*[- ]?\s*(\d{1,4}[A-Z]?)\b/);
  if (direct) return { code: direct[1], number: `${direct[1]} ${direct[2]}` };

  for (const [pattern, code] of AIRLINE_NAMES) {
    const airlineMatch = text.match(pattern);
    if (!airlineMatch) continue;
    const suffix = text.slice((airlineMatch.index ?? 0) + airlineMatch[0].length);
    const number = suffix.match(/\b(?:flight\s*)?#?\s*(\d{1,4}[A-Z]?)\b/i);
    if (number) return { code, number: `${code} ${number[1]}` };
  }

  return null;
}

function findRoute(text: string) {
  const upper = text.toUpperCase();
  const direct = upper.match(/\b([A-Z]{3})\s*(?:→|->|>| TO |–|—|-)\s*([A-Z]{3})\b/);
  if (direct) return { departure: direct[1], arrival: direct[2] };

  const codes = Array.from(upper.matchAll(/(?:\(|\b)([A-Z]{3})(?:\)|\b)/g))
    .map((match) => match[1])
    .filter((code) => !["THE", "FLY", "AIR", "AM", "PM", "USA"].includes(code));
  const uniqueCodes = [...new Set(codes)];
  if (uniqueCodes.length >= 2) return { departure: uniqueCodes[0], arrival: uniqueCodes[1] };
  if (uniqueCodes.length === 1 && /\b(?:flight|fly)\s+to\b/i.test(text)) return { departure: "DFW", arrival: uniqueCodes[0] };
  if (uniqueCodes.length === 1 && /\b(?:flight|fly)\s+from\b/i.test(text)) return { departure: uniqueCodes[0], arrival: "DFW" };
  return null;
}

function detail(text: string, pattern: RegExp) {
  return text.match(pattern)?.[1]?.trim() ?? "";
}

export function flightFromCalendarEvent(event: CalendarEvent): WestWallUpcomingFlight | null {
  const searchable = `${event.title} ${event.location} ${event.description}`;
  const flight = findFlightNumber(searchable);
  const route = findRoute(searchable);
  if (!flight || !route) return null;

  return {
    id: `westwall-calendar-${stableHash(event.id)}`,
    airline: AIRLINES[flight.code] ?? flight.code,
    flightNumber: flight.number,
    departureAirport: route.departure,
    arrivalAirport: route.arrival,
    departureTime: event.startsAt,
    arrivalTime: event.endsAt ?? "",
    gate: detail(searchable, /\bgate\s*[:#-]?\s*([A-Z0-9-]+)/i),
    terminal: detail(searchable, /\bterminal\s*[:#-]?\s*([A-Z0-9-]+)/i),
    status: "Scheduled",
    seat: detail(searchable, /\bseats?\b\s*[:#-]?\s*([0-9]{1,2}[A-Z](?:\s*,\s*[0-9]{1,2}[A-Z])*)\b/i),
    confirmation: detail(searchable, /\b(?:confirmation|record locator|conf)\s*[:#-]?\s*([A-Z0-9]+)/i),
    source: "calendar",
    sourceEventId: event.id,
    syncedAt: new Date().toISOString()
  };
}

export async function syncWestWallFlightsFromCalendar({ refresh = false }: { refresh?: boolean } = {}) {
  const calendar = await getAppleCalendarEvents({ refresh });
  const detectedFlights = calendar.events.map(flightFromCalendarEvent).filter((flight): flight is WestWallUpcomingFlight => Boolean(flight));
  const uniqueFlights = new Map<string, WestWallUpcomingFlight>();
  for (const flight of detectedFlights) {
    const key = `${flight.flightNumber.replaceAll(" ", "")}|${flight.departureAirport}|${flight.arrivalAirport}|${flight.departureTime}`;
    if (!uniqueFlights.has(key)) uniqueFlights.set(key, flight);
  }
  const flights = [...uniqueFlights.values()];

  for (const flight of flights) await upsertCalendarWestWallFlight(flight);
  await pruneCalendarWestWallFlights(flights.map((flight) => flight.sourceEventId));

  return {
    configured: calendar.configured,
    scannedEvents: calendar.events.length,
    matchedFlights: flights.length,
    syncedAt: new Date().toISOString(),
    flights
  };
}
