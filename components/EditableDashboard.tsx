"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  Clock,
  CloudSun,
  ClipboardList,
  Download,
  FileText,
  Heart,
  Home,
  Link,
  Map,
  NotebookPen,
  Plane,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Sun,
  Trash2,
  Upload
} from "lucide-react";
import {
  dashboardSections,
  planningQueue,
  todayMetrics,
  type DashboardMetric,
  type DashboardPlan,
  type DashboardSection
} from "@/data/dashboard";

type StoredSection = Omit<DashboardSection, "icon">;
type StoredPlan = Omit<DashboardPlan, "icon">;

type DashboardState = {
  metrics: DashboardMetric[];
  plans: StoredPlan[];
  sections: StoredSection[];
};

type AppleCalendarEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  location: string;
};

type CalendarResponse = {
  configured: boolean;
  events: AppleCalendarEvent[];
  error?: string;
};

type DashboardDataResponse = {
  state: DashboardState;
  source?: "r2" | "default";
};

type SearchResult = {
  id: string;
  source: string;
  text: string;
};

type WeatherState = {
  temperature: number | null;
  condition: string;
  windSpeed: number | null;
  location: string;
  status: "loading" | "ready" | "unavailable";
};

const STORAGE_KEY = "personal-os-dashboard-v1";

const iconMap = {
  Today: Sun,
  Calendar: CalendarDays,
  Tasks: CheckSquare,
  Notes: NotebookPen,
  "Quick Links": Link,
  Documents: FileText,
  Travel: Plane,
  Home,
  Wedding: Heart,
  "Work Resources": BriefcaseBusiness,
  Review: ClipboardList,
  "Next Trip": Map
};

const categoryHints: Record<string, string[]> = {
  Today: [
    "today",
    "now",
    "priority",
    "morning",
    "daily",
    "prep",
    "tonight",
    "urgent",
    "focus",
    "routine"
  ],
  Calendar: [
    "calendar",
    "meeting",
    "appointment",
    "schedule",
    "event",
    "call",
    "date",
    "time",
    "reservation",
    "deadline"
  ],
  Tasks: [
    "task",
    "todo",
    "send",
    "book",
    "buy",
    "finish",
    "renew",
    "call",
    "email",
    "pay",
    "order",
    "pick",
    "submit",
    "follow",
    "fix"
  ],
  Notes: [
    "note",
    "idea",
    "remember",
    "thought",
    "question",
    "draft",
    "list",
    "journal",
    "brainstorm",
    "maybe"
  ],
  "Quick Links": [
    "link",
    "url",
    "website",
    "login",
    "portal",
    "app",
    "shortcut",
    "dashboard",
    "account"
  ],
  Documents: [
    "document",
    "file",
    "pdf",
    "form",
    "paperwork",
    "tax",
    "resume",
    "contract",
    "license",
    "passport",
    "statement",
    "receipt",
    "invoice"
  ],
  Travel: [
    "travel",
    "trip",
    "flight",
    "hotel",
    "packing",
    "itinerary",
    "passport",
    "vacation",
    "airbnb",
    "rental",
    "luggage",
    "reservation"
  ],
  Home: [
    "home",
    "house",
    "maintenance",
    "utility",
    "repair",
    "contractor",
    "clean",
    "garage",
    "lawn",
    "mortgage",
    "insurance",
    "appliance"
  ],
  Wedding: [
    "wedding",
    "vendor",
    "guest",
    "venue",
    "registry",
    "budget",
    "timeline",
    "invite",
    "florist",
    "catering",
    "photographer",
    "dj"
  ],
  "Work Resources": [
    "work",
    "job",
    "team",
    "template",
    "policy",
    "onboarding",
    "project",
    "client",
    "manager",
    "expense",
    "crm",
    "presentation"
  ]
};

function getInitialState(): DashboardState {
  const plans = planningQueue.map((plan) => ({
    label: plan.label,
    text: plan.text
  }));
  const sections = dashboardSections.map((section) => ({
    title: section.title,
    items: section.items
  }));

  return {
    metrics: todayMetrics,
    plans,
    sections
  };
}

function readStoredState(): DashboardState {
  if (typeof window === "undefined") {
    return getInitialState();
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return getInitialState();
  }

  try {
    const parsed = JSON.parse(saved) as DashboardState;
    return {
      metrics: Array.isArray(parsed.metrics) ? parsed.metrics : todayMetrics,
      plans: Array.isArray(parsed.plans) ? parsed.plans : getInitialState().plans,
      sections: Array.isArray(parsed.sections) ? parsed.sections : getInitialState().sections
    };
  } catch {
    return getInitialState();
  }
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
}

function normalizeLabel(value: string) {
  return tokenize(value).join(" ");
}

function scoreText(queryTokens: string[], text: string) {
  const normalizedText = text.toLowerCase();
  return queryTokens.reduce((score, token) => {
    if (normalizedText === token) {
      return score + 5;
    }

    if (normalizedText.includes(token)) {
      return score + 2;
    }

    return score;
  }, 0);
}

function hasExplicitSectionReference(input: string, sectionTitle: string) {
  const normalizedInput = ` ${normalizeLabel(input)} `;
  const normalizedTitle = normalizeLabel(sectionTitle);

  if (!normalizedTitle) {
    return false;
  }

  return (
    normalizedInput.includes(` ${normalizedTitle} `) ||
    input.toLowerCase().includes(`#${normalizedTitle.replace(/\s+/g, "")}`) ||
    input.toLowerCase().startsWith(`${sectionTitle.toLowerCase()}:`)
  );
}

function inferSectionIndex(input: string, sections: StoredSection[]) {
  const inputTokens = tokenize(input);

  if (inputTokens.length === 0) {
    return sections.findIndex((section) => section.title === "Notes");
  }

  const scores = sections.map((section, index) => {
    const hints = categoryHints[section.title] ?? [];
    const sectionText = [section.title, ...hints, ...section.items].join(" ");
    const explicitBoost = hasExplicitSectionReference(input, section.title) ? 50 : 0;
    const titleTokenBoost = scoreText(inputTokens, section.title) * 2;
    const hintBoost = scoreText(inputTokens, hints.join(" ")) * 4;
    const existingItemBoost = scoreText(inputTokens, section.items.join(" "));

    return {
      index,
      score: explicitBoost + titleTokenBoost + hintBoost + existingItemBoost + scoreText(inputTokens, sectionText)
    };
  });

  const bestMatch = scores.sort((a, b) => b.score - a.score)[0];

  if (!bestMatch || bestMatch.score === 0) {
    const notesIndex = sections.findIndex((section) => section.title === "Notes");
    return notesIndex >= 0 ? notesIndex : 0;
  }

  return bestMatch.index;
}

function searchDashboard(
  query: string,
  state: DashboardState,
  calendarEvents: AppleCalendarEvent[]
) {
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    return [] as SearchResult[];
  }

  const searchableItems: SearchResult[] = [
    ...state.metrics.map((metric, index) => ({
      id: `metric-${index}`,
      source: "Today metrics",
      text: `${metric.label}: ${metric.value}`
    })),
    ...state.plans.map((plan, index) => ({
      id: `plan-${index}`,
      source: plan.label,
      text: plan.text
    })),
    ...state.sections.flatMap((section, sectionIndex) =>
      section.items.map((item, itemIndex) => ({
        id: `section-${sectionIndex}-${itemIndex}`,
        source: section.title,
        text: item
      }))
    ),
    ...calendarEvents.map((event) => ({
      id: `calendar-${event.id}`,
      source: "Apple Calendar",
      text: `${event.title}${event.location ? ` at ${event.location}` : ""}`
    }))
  ];

  return searchableItems
    .map((item) => ({
      ...item,
      score: scoreText(queryTokens, `${item.source} ${item.text}`)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

function describeWeather(code: number) {
  if (code === 0) {
    return "Clear";
  }

  if ([1, 2, 3].includes(code)) {
    return "Partly cloudy";
  }

  if ([45, 48].includes(code)) {
    return "Fog";
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return "Drizzle";
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "Rain";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "Snow";
  }

  if ([95, 96, 99].includes(code)) {
    return "Storms";
  }

  return "Weather";
}

function Field({
  label,
  value,
  onChange,
  multiline = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const className =
    "w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-moss focus:ring-4 focus:ring-moss/15";

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${className} min-h-24 resize-y leading-6`}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={className}
        />
      )}
    </label>
  );
}

export function EditableDashboard() {
  const [state, setState] = useState<DashboardState>(() => getInitialState());
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [calendarStatus, setCalendarStatus] = useState("Loading");
  const [calendarEvents, setCalendarEvents] = useState<AppleCalendarEvent[]>([]);
  const [smartInput, setSmartInput] = useState("");
  const [smartStatus, setSmartStatus] = useState("Ready");
  const [now, setNow] = useState(() => new Date());
  const [weather, setWeather] = useState<WeatherState>({
    temperature: null,
    condition: "Loading",
    windSpeed: null,
    location: "Local weather",
    status: "loading"
  });

  useEffect(() => {
    let isActive = true;

    fetch("/api/dashboard-data")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Dashboard data unavailable");
        }

        return response.json() as Promise<DashboardDataResponse>;
      })
      .then((data) => {
        if (!isActive) {
          return;
        }

        const nextState = data.source === "default" ? readStoredState() : data.state;

        setState(nextState);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        setSaveStatus(data.source === "default" ? "Ready to sync" : "Synced");
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setState(readStoredState());
        setSaveStatus("Using local backup");
      })
      .finally(() => {
        if (isActive) {
          setIsLoaded(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let isActive = true;

    function loadWeather(latitude: number, longitude: number, location: string) {
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current_weather: "true",
        temperature_unit: "fahrenheit",
        windspeed_unit: "mph",
        timezone: "auto"
      });

      fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Weather unavailable");
          }

          return response.json() as Promise<{
            current_weather?: {
              temperature?: number;
              windspeed?: number;
              weathercode?: number;
            };
          }>;
        })
        .then((data) => {
          if (!isActive) {
            return;
          }

          const currentWeather = data.current_weather;

          setWeather({
            temperature:
              typeof currentWeather?.temperature === "number"
                ? Math.round(currentWeather.temperature)
                : null,
            condition:
              typeof currentWeather?.weathercode === "number"
                ? describeWeather(currentWeather.weathercode)
                : "Weather",
            windSpeed:
              typeof currentWeather?.windspeed === "number"
                ? Math.round(currentWeather.windspeed)
                : null,
            location,
            status: "ready"
          });
        })
        .catch(() => {
          if (isActive) {
            setWeather((current) => ({ ...current, condition: "Unavailable", status: "unavailable" }));
          }
        });
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          loadWeather(position.coords.latitude, position.coords.longitude, "Current location");
        },
        () => loadWeather(32.7767, -96.797, "Dallas, TX"),
        { timeout: 6000, maximumAge: 30 * 60 * 1000 }
      );
    } else {
      loadWeather(32.7767, -96.797, "Dallas, TX");
    }

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    fetch("/api/calendar")
      .then((response) => response.json() as Promise<CalendarResponse>)
      .then((calendar) => {
        if (!isActive) {
          return;
        }

        setCalendarEvents(calendar.events ?? []);

        if (calendar.error) {
          setCalendarStatus("Unavailable");
        } else if (!calendar.configured) {
          setCalendarStatus("Not connected");
        } else if (calendar.events.length === 0) {
          setCalendarStatus("No upcoming events");
        } else {
          setCalendarStatus("Connected");
        }
      })
      .catch(() => {
        if (isActive) {
          setCalendarStatus("Unavailable");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSaveStatus("Syncing...");

    const saveTimer = window.setTimeout(() => {
      fetch("/api/dashboard-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state })
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Save failed");
          }

          setSaveStatus("Synced");
        })
        .catch(() => setSaveStatus("Saved locally"));
    }, 600);

    return () => window.clearTimeout(saveTimer);
  }, [isLoaded, state]);

  const exportData = useMemo(() => JSON.stringify(state, null, 2), [state]);
  const inferredSection = useMemo(() => inferSectionIndex(smartInput, state.sections), [
    smartInput,
    state.sections
  ]);
  const searchResults = useMemo(() => searchDashboard(smartInput, state, calendarEvents), [
    calendarEvents,
    smartInput,
    state
  ]);

  function updateMetric(index: number, key: keyof DashboardMetric, value: string) {
    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      metrics: current.metrics.map((metric, metricIndex) =>
        metricIndex === index ? { ...metric, [key]: value } : metric
      )
    }));
  }

  function addMetric() {
    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      metrics: [...current.metrics, { label: "New label", value: "0" }]
    }));
  }

  function removeMetric(index: number) {
    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      metrics: current.metrics.filter((_, metricIndex) => metricIndex !== index)
    }));
  }

  function updatePlan(index: number, key: keyof StoredPlan, value: string) {
    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      plans: current.plans.map((plan, planIndex) =>
        planIndex === index ? { ...plan, [key]: value } : plan
      )
    }));
  }

  function addPlan() {
    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      plans: [...current.plans, { label: "New plan", text: "Add details here." }]
    }));
  }

  function removePlan(index: number) {
    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      plans: current.plans.filter((_, planIndex) => planIndex !== index)
    }));
  }

  function updateSectionTitle(index: number, value: string) {
    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, title: value } : section
      )
    }));
  }

  function addSection() {
    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      sections: [...current.sections, { title: "New Section", items: ["New item"] }]
    }));
  }

  function removeSection(index: number) {
    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      sections: current.sections.filter((_, sectionIndex) => sectionIndex !== index)
    }));
  }

  function updateSectionItem(sectionIndex: number, itemIndex: number, value: string) {
    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      sections: current.sections.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? {
              ...section,
              items: section.items.map((item, currentItemIndex) =>
                currentItemIndex === itemIndex ? value : item
              )
            }
          : section
      )
    }));
  }

  function addSectionItem(sectionIndex: number) {
    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      sections: current.sections.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? { ...section, items: [...section.items, "New item"] }
          : section
      )
    }));
  }

  function removeSectionItem(sectionIndex: number, itemIndex: number) {
    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      sections: current.sections.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? { ...section, items: section.items.filter((_, currentItemIndex) => currentItemIndex !== itemIndex) }
          : section
      )
    }));
  }

  function resetDashboard() {
    setState(getInitialState());
    setSaveStatus("Saved");
  }

  function downloadDashboard() {
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const linkElement = document.createElement("a");
    linkElement.href = url;
    linkElement.download = "personal-dashboard.json";
    linkElement.click();
    URL.revokeObjectURL(url);
  }

  function importDashboard(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as DashboardState;
        setState({
          metrics: Array.isArray(parsed.metrics) ? parsed.metrics : todayMetrics,
          plans: Array.isArray(parsed.plans) ? parsed.plans : getInitialState().plans,
          sections: Array.isArray(parsed.sections) ? parsed.sections : getInitialState().sections
        });
        setSaveStatus("Saved");
      } catch {
        setSaveStatus("Import failed");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function addSmartItem() {
    const item = smartInput.trim();

    if (!item) {
      setSmartStatus("Nothing to add");
      return;
    }

    const sectionIndex = inferredSection >= 0 ? inferredSection : 0;
    const sectionTitle = state.sections[sectionIndex]?.title ?? "Notes";

    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      sections: current.sections.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? { ...section, items: [item, ...section.items] }
          : section
      )
    }));
    setSmartInput("");
    setSmartStatus(`Added to ${sectionTitle}`);
  }

  function formatCalendarDate(value: string) {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(value));
  }

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(now);
  const formattedTime = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(now);

  return (
    <>
      <section className="mt-6 rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Edit mode</p>
            <p className="mt-1 text-sm text-ink/60">
              Changes sync through Cloudflare R2 so your dashboard follows you across devices.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-md bg-mist px-3 py-2 text-sm font-semibold text-ink/70">
              <Save size={16} aria-hidden="true" />
              {saveStatus}
            </span>
            <button
              type="button"
              onClick={downloadDashboard}
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mist"
            >
              <Download size={16} aria-hidden="true" />
              Export
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mist">
              <Upload size={16} aria-hidden="true" />
              Import
              <input type="file" accept="application/json" onChange={importDashboard} className="sr-only" />
            </label>
            <button
              type="button"
              onClick={resetDashboard}
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mist"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-mist text-moss">
              <CalendarDays size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Today</p>
              <p className="mt-1 text-lg font-semibold text-ink">{formattedDate}</p>
            </div>
          </div>
        </article>
        <article className="rounded-lg border border-ink/10 bg-ink p-5 text-paper shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-paper/10 text-amber">
              <Clock size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-paper/50">Time</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{formattedTime}</p>
            </div>
          </div>
        </article>
        <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-mist text-clay">
              <CloudSun size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
                {weather.location}
              </p>
              <p className="mt-1 truncate text-lg font-semibold text-ink">
                {weather.status === "loading"
                  ? "Loading"
                  : `${weather.temperature ?? "--"}°F · ${weather.condition}`}
              </p>
              {weather.windSpeed !== null ? (
                <p className="mt-1 text-sm text-ink/55">{weather.windSpeed} mph wind</p>
              ) : null}
            </div>
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-mist text-moss">
              <Sparkles size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">AI Search & Capture</h2>
              <p className="mt-1 text-sm text-ink/60">{smartStatus}</p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 lg:max-w-2xl">
            <label className="relative block">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35"
                aria-hidden="true"
              />
              <input
                value={smartInput}
                onChange={(event) => {
                  setSmartInput(event.target.value);
                  setSmartStatus("Ready");
                }}
                placeholder="Search or add material..."
                className="w-full rounded-md border border-ink/10 bg-white py-3 pl-10 pr-3 text-sm text-ink outline-none transition focus:border-moss focus:ring-4 focus:ring-moss/15"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-md bg-mist px-3 py-2 text-sm font-semibold text-ink/65">
                {state.sections[inferredSection]?.title ?? "Notes"}
              </span>
              <button
                type="button"
                onClick={addSmartItem}
                className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-moss"
              >
                <Plus size={16} aria-hidden="true" />
                Add
              </button>
            </div>
          </div>
        </div>
        {searchResults.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {searchResults.map((result) => (
              <article key={result.id} className="rounded-md border border-ink/10 bg-mist/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
                  {result.source}
                </p>
                <p className="mt-2 text-sm leading-6 text-ink">{result.text}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-mist text-moss">
              <CalendarDays size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">Apple Calendar</h2>
              <p className="mt-1 text-sm text-ink/60">{calendarStatus}</p>
            </div>
          </div>
        </div>
        {calendarEvents.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {calendarEvents.map((event) => (
              <article key={event.id} className="rounded-md border border-ink/10 bg-mist/50 p-4">
                <p className="text-sm font-semibold text-ink">{event.title}</p>
                <p className="mt-2 text-sm text-ink/65">{formatCalendarDate(event.startsAt)}</p>
                {event.location ? (
                  <p className="mt-1 text-sm text-ink/55">{event.location}</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Labels</h2>
          <button
            type="button"
            onClick={addMetric}
            className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mist"
          >
            <Plus size={16} aria-hidden="true" />
            Add label
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {state.metrics.map((metric, index) => (
            <article
              key={`${metric.label}-${index}`}
              className={`rounded-lg border border-ink/10 p-5 shadow-sm ${
                index === 0 ? "bg-clay text-white" : "bg-white text-ink"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Field
                    label="Label"
                    value={metric.label}
                    onChange={(value) => updateMetric(index, "label", value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeMetric(index)}
                  className={`mt-5 grid size-10 shrink-0 place-items-center rounded-md border transition ${
                    index === 0
                      ? "border-white/20 bg-white/10 text-white hover:bg-white hover:text-clay"
                      : "border-ink/10 bg-white text-ink/60 hover:bg-clay hover:text-white"
                  }`}
                  aria-label={`Remove ${metric.label}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3">
                <Field
                  label="Value"
                  value={metric.value}
                  onChange={(value) => updateMetric(index, "value", value)}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Plan Labels</h2>
          <button
            type="button"
            onClick={addPlan}
            className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mist"
          >
            <Plus size={16} aria-hidden="true" />
            Add plan
          </button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {state.plans.map((item, index) => {
            const Icon = iconMap[item.label as keyof typeof iconMap] ?? ClipboardList;

            return (
              <article key={`${item.label}-${index}`} className="surface rounded-lg p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-md bg-mist text-moss">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <Field
                      label="Plan"
                      value={item.label}
                      onChange={(value) => updatePlan(index, "label", value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePlan(index)}
                    className="grid size-10 shrink-0 place-items-center rounded-md border border-ink/10 bg-white text-ink/60 transition hover:bg-clay hover:text-white"
                    aria-label={`Remove ${item.label}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-4">
                  <Field
                    label="Details"
                    value={item.text}
                    onChange={(value) => updatePlan(index, "text", value)}
                    multiline
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Sections</h2>
          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mist"
          >
            <Plus size={16} aria-hidden="true" />
            Add section
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.sections.map((section, sectionIndex) => {
            const Icon = iconMap[section.title as keyof typeof iconMap] ?? NotebookPen;

            return (
              <section key={`${section.title}-${sectionIndex}`} className="surface rounded-lg p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-mist text-moss">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <Field
                      label="Section"
                      value={section.title}
                      onChange={(value) => updateSectionTitle(sectionIndex, value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    className="grid size-10 shrink-0 place-items-center rounded-md border border-ink/10 bg-white text-ink/60 transition hover:bg-clay hover:text-white"
                    aria-label={`Remove ${section.title}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div key={`${section.title}-${itemIndex}`} className="flex items-end gap-2">
                      <div className="flex-1">
                        <Field
                          label={`Item ${itemIndex + 1}`}
                          value={item}
                          onChange={(value) => updateSectionItem(sectionIndex, itemIndex, value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSectionItem(sectionIndex, itemIndex)}
                        className="grid size-10 shrink-0 place-items-center rounded-md border border-ink/10 bg-white text-ink/60 transition hover:bg-clay hover:text-white"
                        aria-label={`Remove ${item}`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addSectionItem(sectionIndex)}
                  className="mt-4 inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mist"
                >
                  <Plus size={16} aria-hidden="true" />
                  Add item
                </button>
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}
