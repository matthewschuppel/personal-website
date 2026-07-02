import { getCloudflareContext } from "@opennextjs/cloudflare";

export type CalendarEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  location: string;
};

type RawEvent = {
  uid?: string;
  summary?: string;
  dtstart?: string;
  dtend?: string;
  location?: string;
};

function getCalendarUrl() {
  try {
    const context = getCloudflareContext();
    const url = (context.env as CloudflareEnv & { APPLE_CALENDAR_ICS_URL?: string })
      .APPLE_CALENDAR_ICS_URL;

    if (url) {
      return url;
    }
  } catch {
    // Fall back to local Next.js env values during development.
  }

  return process.env.APPLE_CALENDAR_ICS_URL;
}

function unfoldIcsLines(ics: string) {
  return ics
    .replace(/\r\n/g, "\n")
    .split("\n")
    .reduce<string[]>((lines, line) => {
      if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0) {
        lines[lines.length - 1] += line.slice(1);
      } else {
        lines.push(line);
      }

      return lines;
    }, []);
}

function getFieldName(line: string) {
  const separatorIndex = line.indexOf(":");
  const name = separatorIndex >= 0 ? line.slice(0, separatorIndex) : line;
  return name.split(";")[0].toUpperCase();
}

function getFieldValue(line: string) {
  const separatorIndex = line.indexOf(":");
  return separatorIndex >= 0 ? line.slice(separatorIndex + 1) : "";
}

function decodeIcsValue(value: string) {
  return value
    .replace(/\\n/g, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

function parseIcsDate(value: string) {
  const dateOnlyMatch = value.match(/^(\d{4})(\d{2})(\d{2})$/);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(`${year}-${month}-${day}T00:00:00`);
  }

  const dateTimeMatch = value.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/
  );

  if (!dateTimeMatch) {
    return null;
  }

  const [, year, month, day, hour, minute, second, utc] = dateTimeMatch;
  const isoDate = `${year}-${month}-${day}T${hour}:${minute}:${second}${utc ? "Z" : ""}`;
  const parsedDate = new Date(isoDate);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function parseEvents(ics: string) {
  const lines = unfoldIcsLines(ics);
  const events: RawEvent[] = [];
  let currentEvent: RawEvent | null = null;

  for (const line of lines) {
    const fieldName = getFieldName(line);

    if (fieldName === "BEGIN" && getFieldValue(line) === "VEVENT") {
      currentEvent = {};
      continue;
    }

    if (fieldName === "END" && getFieldValue(line) === "VEVENT") {
      if (currentEvent) {
        events.push(currentEvent);
      }
      currentEvent = null;
      continue;
    }

    if (!currentEvent) {
      continue;
    }

    const value = decodeIcsValue(getFieldValue(line));

    if (fieldName === "UID") {
      currentEvent.uid = value;
    }

    if (fieldName === "SUMMARY") {
      currentEvent.summary = value;
    }

    if (fieldName === "DTSTART") {
      currentEvent.dtstart = value;
    }

    if (fieldName === "DTEND") {
      currentEvent.dtend = value;
    }

    if (fieldName === "LOCATION") {
      currentEvent.location = value;
    }
  }

  const now = new Date();
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  return events
    .map((event, index) => {
      const startsAt = event.dtstart ? parseIcsDate(event.dtstart) : null;
      const endsAt = event.dtend ? parseIcsDate(event.dtend) : null;

      if (!startsAt) {
        return null;
      }

      return {
        id: event.uid ?? `${event.summary}-${event.dtstart}-${index}`,
        title: event.summary || "Untitled event",
        startsAt,
        endsAt,
        location: event.location || ""
      };
    })
    .filter((event): event is NonNullable<typeof event> => {
      if (!event) {
        return false;
      }

      return event.startsAt >= now && event.startsAt <= ninetyDaysFromNow;
    })
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, 8)
    .map<CalendarEvent>((event) => ({
      id: event.id,
      title: event.title,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt?.toISOString() ?? null,
      location: event.location
    }));
}

export async function getAppleCalendarEvents() {
  const calendarUrl = getCalendarUrl();

  if (!calendarUrl) {
    return {
      configured: false,
      events: [] as CalendarEvent[]
    };
  }

  const response = await fetch(calendarUrl, {
    headers: { Accept: "text/calendar,*/*" },
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error(`Calendar fetch failed with ${response.status}`);
  }

  return {
    configured: true,
    events: parseEvents(await response.text())
  };
}
