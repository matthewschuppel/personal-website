"use client";

import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  Brain,
  CalendarDays,
  Check,
  Command,
  Edit3,
  FilePlus2,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Trash2,
  UploadCloud,
  X
} from "lucide-react";
import {
  financeResources,
  featureSections,
  homeResources,
  knowledgeResources,
  mockBookmarks,
  mockDocuments,
  mockEvents,
  mockHabits,
  mockNotes,
  mockProjects,
  mockTasks,
  mockTrips,
  osNavigation,
  photographyResources,
  quickActions,
  weddingResources,
  workResources,
  type DashboardSectionKey,
  type FeatureSection,
  type MockBookmark,
  type MockDocument,
  type MockHabit,
  type MockHabitFrequency,
  type MockNote,
  type MockProject,
  type MockResource,
  type MockTask,
  type MockTrip
} from "@/data/matthewos";

type ComposerMode = "note" | "task" | "habit" | "document" | "trip" | "project" | "bookmark";
type ResourceKey = "Home" | "Work" | "Photography" | "Wedding" | "Finance" | "Knowledge Library";
type ConnectionState = "loading" | "connected" | "fallback" | "error";

type UnifiedItem = {
  id: string;
  type: string;
  title: string;
  detail: string;
  section: string;
  status: string;
  sourceId: string;
};

type AuditCheck = {
  label: string;
  status: string;
  detail: string;
};

type WeatherState = {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  windSpeed: number;
  precipitation: number;
  units: { temperature: string; windSpeed: string };
  source: string;
};

type DashboardCalendarEvent = {
  id: string;
  title: string;
  time: string;
  calendar: "Apple Calendar" | "Personal" | "Work" | "Home" | "Wedding";
  location?: string;
  startsAt?: string;
};

type CalendarResponse = {
  configured: boolean;
  events: Array<{ id: string; title: string; startsAt: string; endsAt: string | null; location: string }>;
  refreshedAt?: string;
  error?: string;
};

type DashboardSettings = {
  displayName: string;
  weatherLocation: string;
  defaultSection: DashboardSectionKey;
  compactCards: boolean;
};

const defaultSettings: DashboardSettings = {
  displayName: "Matthew",
  weatherLocation: "Dallas, TX",
  defaultSection: "Today",
  compactCards: false
};

const composerLabels: Record<ComposerMode, string> = {
  note: "New Note",
  task: "New Task",
  habit: "Add Habit",
  document: "Upload Document",
  trip: "Add Trip",
  project: "Add Home Project",
  bookmark: "Add Bookmark"
};

const resourceSeed: Record<ResourceKey, MockResource[]> = {
  Home: homeResources,
  Work: workResources,
  Photography: photographyResources,
  Wedding: weddingResources,
  Finance: financeResources,
  "Knowledge Library": knowledgeResources
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 22) return "Good Evening";
  return "Good Night";
}

function getDateLabel() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date());
}

function formatCalendarTime(startsAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(startsAt));
}

function getDefaultEvents(): DashboardCalendarEvent[] {
  return mockEvents.map((event) => ({ ...event }));
}

function classifyCapture(value: string): ComposerMode {
  const text = value.toLowerCase();

  if (text.includes("task") || text.includes("todo") || text.includes("call") || text.includes("follow up")) return "task";
  if (text.includes("habit") || text.includes("daily") || text.includes("weekday") || text.includes("routine")) return "habit";
  if (text.includes("trip") || text.includes("flight") || text.includes("hotel") || text.includes("travel")) return "trip";
  if (text.includes("upload") || text.includes("pdf") || text.includes("document") || text.includes("file")) return "document";
  if (text.includes("http") || text.includes("link") || text.includes("bookmark")) return "bookmark";
  if (text.includes("project") || text.includes("home")) return "project";
  return "note";
}

function isWeatherState(value: WeatherState | { error?: string }): value is WeatherState {
  return "temperature" in value && "location" in value;
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMonthDays() {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), index + 1);
    return {
      day: index + 1,
      dateKey: formatDateKey(date),
      isToday: formatDateKey(date) === formatDateKey(now),
      isFuture: date > now
    };
  });
}

function getMonthLabel() {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date());
}

function getWeekdayCountThisMonth() {
  return getMonthDays().filter((day) => {
    const weekday = new Date(`${day.dateKey}T12:00:00`).getDay();
    return weekday > 0 && weekday < 6;
  }).length;
}

function getHabitTarget(frequency: MockHabitFrequency) {
  const daysInMonth = getMonthDays().length;

  if (frequency === "Daily") return daysInMonth;
  if (frequency === "Weekdays") return getWeekdayCountThisMonth();
  if (frequency === "3x/week") return Math.ceil((daysInMonth / 7) * 3);
  if (frequency === "2x/week") return Math.ceil((daysInMonth / 7) * 2);
  return Math.ceil(daysInMonth / 7);
}

function getCurrentMonthCompletions(habit: MockHabit) {
  const monthPrefix = formatDateKey(new Date()).slice(0, 7);
  return habit.completions.filter((date) => date.startsWith(monthPrefix));
}

function getHabitStreak(habit: MockHabit) {
  const completions = new Set(habit.completions);
  let streak = 0;
  const cursor = new Date();

  while (completions.has(formatDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getHabitProgress(habit: MockHabit) {
  const completed = getCurrentMonthCompletions(habit).length;
  const target = getHabitTarget(habit.frequency);
  const percentage = Math.min(100, Math.round((completed / Math.max(target, 1)) * 100));

  return {
    completed,
    target,
    percentage,
    remaining: Math.max(target - completed, 0),
    streak: getHabitStreak(habit)
  };
}

function LightCard({
  title,
  eyebrow,
  meta,
  children,
  compact = false
}: {
  title: string;
  eyebrow?: string;
  meta?: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <article className={`rounded-lg border border-ink/10 bg-white/82 shadow-sm ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">{eyebrow}</p> : null}
          <h3 className="mt-1 font-semibold text-ink">{title}</h3>
        </div>
        {meta ? <span className="rounded-md bg-mist px-2.5 py-1 text-xs font-semibold text-ink/60">{meta}</span> : null}
      </div>
      {children ? <div className="mt-3 text-sm leading-6 text-ink/66">{children}</div> : null}
    </article>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return <span className="rounded-md bg-mist px-2.5 py-1 text-xs font-semibold text-ink/65">{children}</span>;
}

function StatusDot({ state }: { state: ConnectionState }) {
  const color = state === "connected" ? "bg-moss" : state === "loading" ? "bg-amber" : state === "fallback" ? "bg-clay" : "bg-red-500";
  return <span className={`size-2 rounded-full ${color}`} />;
}

function SectionHeader({ section, onAdd }: { section: FeatureSection; onAdd: () => void }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white/78 p-6 shadow-crisp">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">MatthewOS Database</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{section.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/66">{section.description}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper transition hover:bg-moss"
        >
          <Plus size={16} aria-hidden="true" />
          Add Item
        </button>
      </div>
    </div>
  );
}

export function MatthewOSDashboard() {
  const [settings, setSettings] = useState<DashboardSettings>(defaultSettings);
  const [activeSection, setActiveSection] = useState<DashboardSectionKey>("Today");
  const [query, setQuery] = useState("");
  const [capture, setCapture] = useState("");
  const [composerMode, setComposerMode] = useState<ComposerMode>("note");
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandText, setCommandText] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [documentCategory, setDocumentCategory] = useState("All");
  const captureInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState<MockNote[]>(mockNotes);
  const [tasks, setTasks] = useState<MockTask[]>(mockTasks);
  const [habits, setHabits] = useState<MockHabit[]>(mockHabits);
  const [documents, setDocuments] = useState<MockDocument[]>(mockDocuments);
  const [trips, setTrips] = useState<MockTrip[]>(mockTrips);
  const [projects, setProjects] = useState<MockProject[]>(mockProjects);
  const [bookmarks, setBookmarks] = useState<MockBookmark[]>(mockBookmarks);
  const [resourceGroups, setResourceGroups] = useState<Record<ResourceKey, MockResource[]>>(resourceSeed);
  const [events, setEvents] = useState<DashboardCalendarEvent[]>(getDefaultEvents);
  const [activity, setActivity] = useState("Ready.");
  const [dataStatus, setDataStatus] = useState<ConnectionState>("loading");
  const [documentStatus, setDocumentStatus] = useState<ConnectionState>("loading");
  const [calendarStatus, setCalendarStatus] = useState("Loading Apple Calendar...");
  const [calendarConnection, setCalendarConnection] = useState<ConnectionState>("loading");
  const [calendarConfigured, setCalendarConfigured] = useState(false);
  const [calendarSyncedAt, setCalendarSyncedAt] = useState<string | null>(null);
  const [weatherLocation, setWeatherLocation] = useState("Dallas, TX");
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [weatherStatus, setWeatherStatus] = useState("Loading weather...");
  const [weatherConnection, setWeatherConnection] = useState<ConnectionState>("loading");
  const [unifiedItems, setUnifiedItems] = useState<UnifiedItem[]>([]);
  const [auditChecks, setAuditChecks] = useState<AuditCheck[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState("");

  function updateSettings(nextSettings: DashboardSettings) {
    setSettings(nextSettings);
    setWeatherLocation(nextSettings.weatherLocation);
    window.localStorage.setItem("matthewos-settings", JSON.stringify(nextSettings));
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextSettings)
    }).catch(() => undefined);
    setActivity("Settings saved to MatthewOS.");
  }

  useEffect(() => {
    const savedSettings = window.localStorage.getItem("matthewos-settings");

    if (savedSettings) {
      try {
        const parsed = { ...defaultSettings, ...JSON.parse(savedSettings) } as DashboardSettings;
        setSettings(parsed);
        setActiveSection(parsed.defaultSection);
        setWeatherLocation(parsed.weatherLocation);
      } catch {
        setActiveSection(defaultSettings.defaultSection);
      }
    }

    async function loadSavedSettings() {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json() as { settings?: DashboardSettings };

        if (response.ok && data.settings) {
          const nextSettings = { ...defaultSettings, ...data.settings };
          setSettings(nextSettings);
          setActiveSection(nextSettings.defaultSection);
          setWeatherLocation(nextSettings.weatherLocation);
        }
      } catch {
        // Local storage remains the fallback until the D1 settings table is applied.
      }
    }

    void loadSavedSettings();
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      setDataStatus("loading");
      setDocumentStatus("loading");

      try {
        const [tasksResponse, notesResponse, habitsResponse, documentsResponse, tripsResponse, projectsResponse, bookmarksResponse, resourcesResponse] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/notes"),
          fetch("/api/habits"),
          fetch("/api/documents"),
          fetch("/api/trips"),
          fetch("/api/projects"),
          fetch("/api/bookmarks"),
          fetch("/api/resources")
        ]);

        if (tasksResponse.ok) {
          const data = await tasksResponse.json() as { tasks?: MockTask[] };
          setTasks(data.tasks ?? mockTasks);
        }

        if (notesResponse.ok) {
          const data = await notesResponse.json() as { notes?: MockNote[] };
          setNotes(data.notes ?? mockNotes);
        }

        if (habitsResponse.ok) {
          const data = await habitsResponse.json() as { habits?: MockHabit[] };
          setHabits(data.habits ?? mockHabits);
        }

        if (documentsResponse.ok) {
          const data = await documentsResponse.json() as { documents?: MockDocument[] };
          setDocuments(data.documents ?? mockDocuments);
        }

        if (tripsResponse.ok) {
          const data = await tripsResponse.json() as { trips?: MockTrip[] };
          setTrips(data.trips ?? mockTrips);
        }

        if (projectsResponse.ok) {
          const data = await projectsResponse.json() as { projects?: MockProject[] };
          setProjects(data.projects ?? mockProjects);
        }

        if (bookmarksResponse.ok) {
          const data = await bookmarksResponse.json() as { bookmarks?: MockBookmark[] };
          setBookmarks(data.bookmarks ?? mockBookmarks);
        }

        if (resourcesResponse.ok) {
          const data = await resourcesResponse.json() as { resources?: Record<ResourceKey, MockResource[]> };
          setResourceGroups(data.resources ?? resourceSeed);
        }

        setDataStatus(tasksResponse.ok && notesResponse.ok && habitsResponse.ok && tripsResponse.ok && projectsResponse.ok && bookmarksResponse.ok && resourcesResponse.ok ? "connected" : "fallback");
        setDocumentStatus(documentsResponse.ok ? "connected" : "fallback");
        setActivity("Connected to MatthewOS APIs.");
      } catch {
        setDataStatus("fallback");
        setDocumentStatus("fallback");
        setActivity("Using local mock data because the APIs are unavailable in this environment.");
      }
    }

    void loadDashboardData();
  }, []);

  useEffect(() => {
    async function loadOperationalData() {
      try {
        const [unifiedResponse, auditResponse] = await Promise.all([
          fetch("/api/dashboard/unified"),
          fetch("/api/dashboard/audit")
        ]);

        if (unifiedResponse.ok) {
          const data = await unifiedResponse.json() as { items?: UnifiedItem[] };
          setUnifiedItems(data.items ?? []);
        }

        if (auditResponse.ok) {
          const data = await auditResponse.json() as { audit?: { checks?: AuditCheck[] } };
          setAuditChecks(data.audit?.checks ?? []);
        }
      } catch {
        setAuditChecks([{ label: "Operational data", status: "fallback", detail: "Audit APIs are unavailable in this environment." }]);
      }
    }

    void loadOperationalData();
  }, [activity]);

  const loadCalendar = useCallback(async ({ refresh = false }: { refresh?: boolean } = {}) => {
    setCalendarConnection("loading");
    setCalendarStatus(refresh ? "Resyncing Apple Calendar..." : "Loading Apple Calendar...");

    try {
      const response = await fetch(`/api/calendar${refresh ? "?refresh=1" : ""}`);
      const data = await response.json() as CalendarResponse;

      setCalendarConfigured(data.configured);
      setCalendarSyncedAt(data.refreshedAt ?? new Date().toISOString());

      if (!response.ok || data.error) {
        setEvents(getDefaultEvents());
        setCalendarConnection("error");
        setCalendarStatus(data.error ?? "Calendar unavailable. Showing mock events.");
        return;
      }

      if (!data.configured) {
        setEvents(getDefaultEvents());
        setCalendarConnection("fallback");
        setCalendarStatus("Apple Calendar URL is not configured. Showing mock events.");
        return;
      }

      setEvents(
        data.events.map((event) => ({
          id: event.id,
          title: event.title,
          time: formatCalendarTime(event.startsAt),
          calendar: "Apple Calendar",
          location: event.location,
          startsAt: event.startsAt
        }))
      );
      setCalendarConnection("connected");
      setCalendarStatus(data.events.length ? `Apple Calendar synced with ${data.events.length} upcoming events.` : "Apple Calendar synced. No upcoming events found.");
    } catch {
      setEvents(getDefaultEvents());
      setCalendarConnection("error");
      setCalendarStatus("Calendar unavailable. Showing mock events.");
    }
  }, []);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  const loadWeather = useCallback(async (location: string) => {
    const nextLocation = location.trim() || "Dallas, TX";

    setWeatherConnection("loading");
    setWeatherStatus(`Loading weather for ${nextLocation}...`);

    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(nextLocation)}`);
      const data = await response.json() as WeatherState | { error?: string };

      if (!response.ok || !isWeatherState(data)) {
        setWeatherConnection("fallback");
        setWeatherStatus("Weather unavailable. Showing Dallas fallback soon.");

        if (nextLocation !== "Dallas, TX") {
          await loadWeather("Dallas, TX");
        }

        return;
      }

      setWeather(data);
      setWeatherLocation(nextLocation);
      setWeatherConnection("connected");
      setWeatherStatus(`${data.location} weather from ${data.source}`);
      window.localStorage.setItem("matthewos-weather-location", nextLocation);
    } catch {
      setWeatherConnection("error");
      setWeatherStatus("Weather unavailable right now.");
    }
  }, []);

  useEffect(() => {
    const savedLocation = window.localStorage.getItem("matthewos-weather-location");
    void loadWeather(savedLocation || settings.weatherLocation || "Dallas, TX");
  }, [loadWeather, settings.weatherLocation]);

  const activeFeature = featureSections.find((section) => section.title === activeSection);
  const todayTasks = tasks.filter((task) => task.status === "Today").slice(0, 3);
  const recentNotes = notes.slice(0, 3);
  const monthDays = useMemo(() => getMonthDays(), []);
  const todayDateKey = formatDateKey(new Date());
  const monthlyHabitAverage = habits.length
    ? Math.round(habits.reduce((total, habit) => total + getHabitProgress(habit).percentage, 0) / habits.length)
    : 0;
  const todayHabitCheckins = habits.filter((habit) => habit.completions.includes(todayDateKey)).length;
  const documentCategories = ["All", ...Array.from(new Set(documents.map((document) => String(document.category))))];
  const filteredDocuments = documentCategory === "All" ? documents : documents.filter((document) => document.category === documentCategory);
  const openTasks = tasks.filter((task) => task.status !== "Done").length;
  const compact = settings.compactCards;

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return [];

    return [
      ...notes.map((item) => ({ type: "Note", title: item.title, detail: item.summary })),
      ...tasks.map((item) => ({ type: "Task", title: item.title, detail: `${item.area} / ${item.status}` })),
      ...habits.map((item) => ({ type: "Habit", title: item.title, detail: `${item.frequency} / ${getHabitProgress(item).percentage}% this month` })),
      ...documents.map((item) => ({ type: "Document", title: item.title, detail: `${item.category} / ${item.type}` })),
      ...trips.map((item) => ({ type: "Trip", title: item.destination, detail: item.detail })),
      ...bookmarks.map((item) => ({ type: "Bookmark", title: item.title, detail: item.description })),
      ...unifiedItems.map((item) => ({ type: item.type, title: item.title, detail: `${item.section} / ${item.detail} / ${item.status}` })),
      ...Object.entries(resourceGroups).flatMap(([section, resources]) =>
        resources.map((item) => ({ type: section, title: item.title, detail: item.detail }))
      )
    ]
      .filter((item) => `${item.type} ${item.title} ${item.detail}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 10);
  }, [bookmarks, documents, habits, notes, query, resourceGroups, tasks, trips, unifiedItems]);

  function openComposer(mode: ComposerMode, preset = "") {
    if (mode === "document") {
      fileInputRef.current?.click();
      return;
    }

    setComposerMode(mode);
    setCapture(preset);
  }

  async function saveCapture() {
    const value = (captureInputRef.current?.value ?? capture).trim();

    if (!value) {
      setActivity("Type something first, then save it into MatthewOS.");
      return;
    }

    await saveTypedItem(composerMode === "note" ? classifyCapture(value) : composerMode, value);
    setCapture("");

    if (captureInputRef.current) {
      captureInputRef.current.value = "";
    }

    setComposerMode("note");
  }

  async function saveTypedItem(mode: ComposerMode, value: string) {
    const id = `${mode}-${Date.now()}`;

    if (mode === "task") {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: value, priority: "Medium", status: "Today", dueDate: "Today", area: "Today" })
      });
      const data = await response.json().catch(() => null) as { task?: MockTask } | null;
      setTasks((current) => [
        data?.task ?? { id, title: value, priority: "Medium", status: "Today", dueDate: "Today", area: "Today" },
        ...current
      ]);
      setActiveSection("Tasks");
    }

    if (mode === "note") {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: value, summary: "Captured from MatthewOS.", tags: ["Inbox"] })
      });
      const data = await response.json().catch(() => null) as { note?: MockNote } | null;
      setNotes((current) => [
        data?.note ?? { id, title: value, summary: "Captured from MatthewOS.", tags: ["Inbox"], updatedAt: "Just now" },
        ...current
      ]);
      setActiveSection("Notes");
    }

    if (mode === "habit") {
      const habit = await createHabitFromValue(value, "Daily");
      setHabits((current) => [habit, ...current]);
      setActiveSection("Habits");
    }

    if (mode === "trip") {
      const fallback: MockTrip = { id, destination: value, dates: "TBD", status: "Idea", detail: "Captured trip idea ready for details." };
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fallback)
      }).catch(() => null);
      const data = await response?.json().catch(() => null) as { trip?: MockTrip } | null;
      setTrips((current) => [data?.trip ?? fallback, ...current]);
      setActiveSection("Travel");
    }

    if (mode === "project") {
      const fallback: MockProject = { id, title: value, area: "Home", status: "New", nextStep: "Define next action." };
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fallback)
      }).catch(() => null);
      const data = await response?.json().catch(() => null) as { project?: MockProject } | null;
      setProjects((current) => [data?.project ?? fallback, ...current]);
      setActiveSection("Home");
    }

    if (mode === "bookmark") {
      const fallback: MockBookmark = { id, title: value, category: "Knowledge Library", url: value.startsWith("http") ? value : "#", description: "Captured bookmark ready for notes." };
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fallback)
      }).catch(() => null);
      const data = await response?.json().catch(() => null) as { bookmark?: MockBookmark } | null;
      setBookmarks((current) => [data?.bookmark ?? fallback, ...current]);
      setActiveSection("Knowledge Library");
    }

    if (mode === "document") {
      fileInputRef.current?.click();
      return;
    }

    setActivity(`Saved "${value}" as ${composerLabels[mode].toLowerCase()}.`);
  }

  async function createHabitFromValue(title: string, frequency: MockHabitFrequency) {
    const fallback: MockHabit = {
      id: `habit-${Date.now()}`,
      title,
      frequency,
      completions: [],
      color: ["moss", "clay", "amber", "ink"][habits.length % 4] as MockHabit["color"]
    };

    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fallback)
      });
      const data = await response.json().catch(() => null) as { habit?: MockHabit } | null;
      return data?.habit ?? fallback;
    } catch {
      return fallback;
    }
  }

  async function addHabit(title: string, frequency: MockHabitFrequency) {
    const value = title.trim();

    if (!value) {
      setActivity("Add a habit name first.");
      return;
    }

    const habit = await createHabitFromValue(value, frequency);
    setHabits((current) => [habit, ...current]);
    setActivity(`Started tracking "${habit.title}" ${habit.frequency.toLowerCase()}.`);
  }

  async function toggleHabitDay(id: string, completedOn: string) {
    setHabits((current) =>
      current.map((habit) => {
        if (habit.id !== id) return habit;
        const exists = habit.completions.includes(completedOn);
        return {
          ...habit,
          completions: exists ? habit.completions.filter((date) => date !== completedOn) : [...habit.completions, completedOn]
        };
      })
    );
    setActivity("Habit check-in updated.");
    await fetch(`/api/habits/${id}/checkins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedOn })
    }).catch(() => undefined);
  }

  async function removeHabit(id: string) {
    setHabits((current) => current.filter((habit) => habit.id !== id));
    setActivity("Habit removed.");
    await fetch(`/api/habits/${id}`, { method: "DELETE" }).catch(() => undefined);
  }

  function handleComposerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveCapture();
  }

  function handleWeatherSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSettings({ ...settings, weatherLocation });
    void loadWeather(weatherLocation);
  }

  async function completeTask(id: string) {
    const existing = tasks.find((task) => task.id === id);
    const nextTask = existing ? { ...existing, status: "Done" as const } : null;

    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status: "Done" } : task)));
    setActivity("Task marked done.");

    if (nextTask) {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextTask)
      }).catch(() => undefined);
    }
  }

  async function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
    setActivity("Task removed.");
    await fetch(`/api/tasks/${id}`, { method: "DELETE" }).catch(() => undefined);
  }

  async function uploadSelectedDocument(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", activeSection === "Documents" ? "Documents" : activeSection);
    setActivity(`Uploading ${file.name} to R2...`);

    try {
      const response = await fetch("/api/documents/upload", { method: "POST", body: formData });
      const data = await response.json() as { document?: MockDocument; error?: string };

      if (!response.ok || !data.document) {
        setActivity(data.error ?? "Document upload failed.");
        return;
      }

      setDocuments((current) => [data.document as MockDocument, ...current]);
      setDocumentStatus("connected");
      setActiveSection("Documents");
      setActivity(`Uploaded ${file.name} to R2 and saved metadata to D1.`);
    } catch {
      setDocumentStatus("error");
      setActivity("Document upload failed because the API was unavailable.");
    }
  }

  async function removeDocument(id: string) {
    setDocuments((current) => current.filter((document) => document.id !== id));
    setActivity("Document removed.");
    await fetch(`/api/documents/${id}`, { method: "DELETE" }).catch(() => undefined);
  }

  async function addEditableResource(section: ResourceKey, title: string) {
    const value = title.trim();

    if (!value) return;

    const fallback: MockResource = {
      id: `${section.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      title: value,
      detail: "New editable item. Add details later.",
      status: "New"
    };
    const response = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, ...fallback })
    }).catch(() => null);
    const data = await response?.json().catch(() => null) as { resource?: MockResource } | null;
    const resource = data?.resource ?? fallback;

    setResourceGroups((current) => ({
      ...current,
      [section]: [
        resource,
        ...current[section]
      ]
    }));
    setActivity(`Added "${value}" to ${section}.`);
  }

  async function removeEditableResource(section: ResourceKey, id: string) {
    setResourceGroups((current) => ({
      ...current,
      [section]: current[section].filter((item) => item.id !== id)
    }));
    setActivity(`Removed item from ${section}.`);
    await fetch(`/api/resources/${id}`, { method: "DELETE" }).catch(() => undefined);
  }

  async function editEditableResource(section: ResourceKey, resource: MockResource) {
    const nextTitle = window.prompt("Item title", resource.title)?.trim();

    if (!nextTitle) return;

    const nextDetail = window.prompt("Item details", resource.detail)?.trim() || resource.detail;
    const nextStatus = window.prompt("Status or label", resource.status)?.trim() || resource.status;
    const nextResource = { ...resource, title: nextTitle, detail: nextDetail, status: nextStatus };

    setResourceGroups((current) => ({
      ...current,
      [section]: current[section].map((item) => (item.id === resource.id ? nextResource : item))
    }));

    await fetch(`/api/resources/${resource.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextResource)
    }).catch(() => undefined);
    setActivity(`Updated "${nextTitle}" in ${section}.`);
  }

  async function createCalendarDraftFromItem(item: UnifiedItem) {
    const title = window.prompt("Calendar event title", item.title)?.trim();

    if (!title) return;

    const startsAt = window.prompt("Start date/time", new Date().toISOString().slice(0, 16))?.trim() || "";
    const response = await fetch("/api/calendar/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, startsAt, notes: item.detail, sourceItemType: item.type, sourceItemId: item.sourceId })
    }).catch(() => null);

    setActivity(response?.ok ? "Calendar draft created. Connect a write-capable calendar provider later to push it automatically." : "Calendar draft failed.");
  }

  async function organizeWithAi() {
    const value = aiInput.trim();

    if (!value) {
      setAiResult("Paste or type something first.");
      return;
    }

    const response = await fetch("/api/dashboard/organize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value })
    }).catch(() => null);
    const data = await response?.json().catch(() => null) as { result?: { category: string; reason: string; tags: string[] } } | null;

    setAiResult(data?.result ? `Saved as ${data.result.category}. ${data.result.reason}` : "Organizer failed.");
    setAiInput("");
    setActivity("AI organize captured an item into MatthewOS.");
  }

  function executeCommand() {
    const value = commandText.trim();

    if (!value) return;

    const lower = value.toLowerCase();
    const resourceSection = (["Home", "Work", "Photography", "Wedding", "Finance", "Knowledge Library"] as ResourceKey[]).find((section) =>
      lower.includes(section.toLowerCase())
    );

    if (resourceSection) {
      void addEditableResource(resourceSection, value.replace(new RegExp(resourceSection, "i"), "").replace(/^[:\s-]+/, "") || value);
    } else {
      void saveTypedItem(classifyCapture(value), value);
    }

    setCommandText("");
    setCommandOpen(false);
  }

  function renderTasks() {
    return (
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex flex-col gap-3 rounded-lg border border-ink/10 bg-white/82 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={`font-semibold ${task.status === "Done" ? "text-ink/35 line-through" : "text-ink"}`}>{task.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill>{task.priority}</Pill>
                <Pill>{task.status}</Pill>
                <Pill>{task.dueDate}</Pill>
                <Pill>{task.area}</Pill>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => void completeTask(task.id)} className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2 text-sm font-semibold text-ink/65 hover:bg-mist">
                <Check size={15} aria-hidden="true" />
                Done
              </button>
              <button type="button" onClick={() => void deleteTask(task.id)} className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2 text-sm font-semibold text-ink/65 hover:bg-mist">
                <Trash2 size={15} aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderHabits() {
    const frequencyOptions: MockHabitFrequency[] = ["Daily", "Weekdays", "3x/week", "2x/week", "Weekly"];

    return (
      <div className="space-y-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            void addHabit(String(formData.get("title") ?? ""), String(formData.get("frequency") ?? "Daily") as MockHabitFrequency);
            event.currentTarget.reset();
          }}
          className="grid gap-2 rounded-lg border border-ink/10 bg-white/82 p-4 shadow-sm md:grid-cols-[1fr_180px_auto]"
        >
          <input name="title" placeholder="Add a habit to track..." className="rounded-md border border-ink/10 bg-white px-3 py-3 text-sm outline-none focus:border-clay focus:ring-4 focus:ring-clay/10" />
          <select name="frequency" defaultValue="Daily" className="rounded-md border border-ink/10 bg-white px-3 py-3 text-sm font-semibold text-ink/70 outline-none">
            {frequencyOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper hover:bg-moss">
            <Plus size={16} aria-hidden="true" />
            Track Habit
          </button>
        </form>

        <div className="grid gap-4 md:grid-cols-3">
          <LightCard title={`${habits.length} tracked habits`} eyebrow={getMonthLabel()}>
            Your monthly tracker uses frequency-based targets so each habit can have a different commitment level.
          </LightCard>
          <LightCard title={`${monthlyHabitAverage}% average progress`} eyebrow="Month">
            Across all habits, based on completed check-ins compared with the target for each frequency.
          </LightCard>
          <LightCard title={`${todayHabitCheckins}/${habits.length} checked in today`} eyebrow="Today">
            Tap today in any habit row to log or undo the check-in.
          </LightCard>
        </div>

        <div className="space-y-4">
          {habits.map((habit) => {
            const progress = getHabitProgress(habit);

            return (
              <article key={habit.id} className="rounded-lg border border-ink/10 bg-white/84 p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-ink">{habit.title}</h3>
                      <Pill>{habit.frequency}</Pill>
                      <Pill>{progress.completed}/{progress.target} this month</Pill>
                      <Pill>{progress.streak} day streak</Pill>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist">
                      <div className="h-full rounded-full bg-moss transition-all" style={{ width: `${progress.percentage}%` }} />
                    </div>
                    <p className="mt-2 text-sm text-ink/55">
                      {progress.percentage}% complete / {progress.remaining ? `${progress.remaining} check-ins left for ${getMonthLabel()}` : "monthly target met"}
                    </p>
                  </div>
                  <button type="button" onClick={() => void removeHabit(habit.id)} className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/10 px-3 py-2 text-sm font-semibold text-ink/60 hover:bg-mist">
                    <Trash2 size={15} aria-hidden="true" />
                    Remove
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-1.5 sm:grid-cols-10 md:grid-cols-12 xl:grid-cols-[repeat(16,minmax(0,1fr))]">
                  {monthDays.map((day) => {
                    const checked = habit.completions.includes(day.dateKey);
                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        onClick={() => void toggleHabitDay(habit.id, day.dateKey)}
                        aria-label={`${checked ? "Remove" : "Add"} ${habit.title} check-in for day ${day.day}`}
                        className={`aspect-square rounded-md border text-xs font-semibold transition ${
                          checked
                            ? "border-moss bg-moss text-paper shadow-sm"
                            : day.isToday
                              ? "border-clay bg-clay/10 text-clay"
                              : day.isFuture
                                ? "border-ink/5 bg-mist/40 text-ink/30"
                                : "border-ink/10 bg-mist/60 text-ink/55 hover:bg-white"
                        }`}
                      >
                        {day.day}
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  function renderEditableResources(section: ResourceKey) {
    return (
      <div className="space-y-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            void addEditableResource(section, String(formData.get("title") ?? ""));
            event.currentTarget.reset();
          }}
          className="grid gap-2 rounded-lg border border-ink/10 bg-white/82 p-4 shadow-sm sm:grid-cols-[1fr_auto]"
        >
          <input name="title" placeholder={`Add to ${section}...`} className="rounded-md border border-ink/10 bg-white px-3 py-3 text-sm outline-none focus:border-clay focus:ring-4 focus:ring-clay/10" />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper hover:bg-moss">
            <Plus size={16} aria-hidden="true" />
            Add
          </button>
        </form>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resourceGroups[section].map((resource) => (
            <LightCard key={resource.id} title={resource.title} eyebrow={section} meta={resource.status} compact={compact}>
              <p>{resource.detail}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" onClick={() => void editEditableResource(section, resource)} className="inline-flex items-center gap-2 text-xs font-semibold text-ink/55 hover:text-moss">
                  <Edit3 size={13} aria-hidden="true" />
                  Edit
                </button>
                <button type="button" onClick={() => void removeEditableResource(section, resource.id)} className="inline-flex items-center gap-2 text-xs font-semibold text-ink/55 hover:text-clay">
                  <Trash2 size={13} aria-hidden="true" />
                  Remove
                </button>
              </div>
            </LightCard>
          ))}
        </div>
      </div>
    );
  }

  function renderSectionContent(section: FeatureSection) {
    if (section.title === "Notes") {
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <LightCard key={note.id} title={note.title} eyebrow="Note" meta={note.updatedAt} compact={compact}>
              <p>{note.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {note.tags.map((tag) => <Pill key={tag}>{tag}</Pill>)}
              </div>
            </LightCard>
          ))}
        </div>
      );
    }

    if (section.title === "Tasks") return renderTasks();

    if (section.title === "Habits") return renderHabits();

    if (section.title === "Health") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <a href="/dashboard/health" className="text-left">
            <LightCard title="Open Health Dashboard" eyebrow="Private Module" compact={compact}>
              Workout planning, nutrition tracking, grocery lists, pantry, progress photos, reminders, and wedding health goals now live in the dedicated Health module.
            </LightCard>
          </a>
          <LightCard title="Persistent Health Data" eyebrow="D1 + R2" compact={compact}>
            Health records are scaffolded for Cloudflare D1, while private progress photos are prepared for Cloudflare R2 through the dashboard bucket binding.
          </LightCard>
        </div>
      );
    }

    if (section.title === "Calendar") {
      return (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-ink/10 bg-white/82 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">{calendarStatus}</p>
              <p className="mt-1 text-xs text-ink/50">
                {calendarSyncedAt ? `Last sync: ${formatCalendarTime(calendarSyncedAt)}` : "Not synced yet"}
                {calendarConfigured ? "" : " / Configure APPLE_CALENDAR_ICS_URL in Cloudflare to use live events."}
              </p>
            </div>
            <button type="button" onClick={() => void loadCalendar({ refresh: true })} className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/10 bg-mist px-4 py-3 text-sm font-semibold text-ink/70 hover:bg-white">
              <RefreshCw size={15} aria-hidden="true" />
              Resync Calendar
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <LightCard key={event.id} title={event.title} eyebrow={event.calendar} meta={event.time} compact={compact}>
                {event.location || "No location listed"}
              </LightCard>
            ))}
          </div>
        </div>
      );
    }

    if (section.title === "Documents") {
      return (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-ink/10 bg-white/82 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper hover:bg-moss">
              <UploadCloud size={16} aria-hidden="true" />
              Upload Document
            </button>
            <select value={documentCategory} onChange={(event) => setDocumentCategory(event.target.value)} className="rounded-md border border-ink/10 bg-white px-3 py-3 text-sm font-semibold text-ink/70 outline-none">
              {documentCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="grid gap-3 rounded-lg border border-ink/10 bg-white/82 p-4 text-sm shadow-sm md:grid-cols-[1.3fr_0.8fr_0.8fr_0.7fr_auto]">
                <p className="font-semibold text-ink">{document.title}</p>
                <p>{document.category}</p>
                <p>{document.type}</p>
                <p>{document.updatedAt}</p>
                <div className="flex gap-2">
                  <a href={`/api/documents/${document.id}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/10 px-3 py-2 font-semibold text-ink/65 hover:bg-mist">
                    <ArrowDownToLine size={15} aria-hidden="true" />
                    Download
                  </a>
                  <button type="button" onClick={() => void removeDocument(document.id)} className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/10 px-3 py-2 font-semibold text-ink/65 hover:bg-mist">
                    <Trash2 size={15} aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (section.title === "Travel") {
      return (
        <div className="space-y-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const destination = String(formData.get("destination") ?? "").trim();
              if (destination) {
                void saveTypedItem("trip", destination);
              }
              event.currentTarget.reset();
            }}
            className="grid gap-2 rounded-lg border border-ink/10 bg-white/82 p-4 shadow-sm sm:grid-cols-[1fr_auto]"
          >
            <input name="destination" placeholder="Add trip..." className="rounded-md border border-ink/10 bg-white px-3 py-3 text-sm outline-none focus:border-clay focus:ring-4 focus:ring-clay/10" />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper hover:bg-moss">
              <Plus size={16} aria-hidden="true" />
              Add Trip
            </button>
          </form>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip) => (
              <LightCard key={trip.id} title={trip.destination} eyebrow={trip.status} meta={trip.dates} compact={compact}>
                <p>{trip.detail}</p>
                <button
                  type="button"
                  onClick={() => {
                    setTrips((current) => current.filter((item) => item.id !== trip.id));
                    void fetch(`/api/trips/${trip.id}`, { method: "DELETE" }).catch(() => undefined);
                  }}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-ink/55 hover:text-clay"
                >
                  <Trash2 size={13} aria-hidden="true" />
                  Remove
                </button>
              </LightCard>
            ))}
          </div>
        </div>
      );
    }

    if (["Home", "Work", "Photography", "Wedding", "Finance", "Knowledge Library"].includes(section.title)) {
      return renderEditableResources(section.title as ResourceKey);
    }

    if (section.title === "Database") {
      const types = Array.from(new Set(unifiedItems.map((item) => item.type)));

      return (
        <div className="space-y-4">
          <div className="rounded-lg border border-ink/10 bg-white/82 p-4 shadow-sm">
            <p className="text-sm leading-6 text-ink/60">
              Unified database view across MatthewOS modules. Use search above to filter across this index, or create a calendar draft from any item.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {types.map((type) => <Pill key={type}>{type}</Pill>)}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-ink/10 bg-white/82 shadow-sm">
            <div className="grid grid-cols-[1fr_120px_140px_120px] gap-3 border-b border-ink/10 bg-mist/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink/50">
              <span>Item</span>
              <span>Type</span>
              <span>Section</span>
              <span>Action</span>
            </div>
            {unifiedItems.slice(0, 60).map((item) => (
              <div key={item.id} className="grid gap-3 border-b border-ink/10 px-4 py-3 text-sm last:border-b-0 md:grid-cols-[1fr_120px_140px_120px]">
                <div>
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-ink/55">{item.detail}</p>
                </div>
                <span>{item.type}</span>
                <span>{item.section}</span>
                <button type="button" onClick={() => void createCalendarDraftFromItem(item)} className="rounded-md border border-ink/10 px-3 py-2 text-xs font-semibold text-ink/60 hover:bg-mist">
                  Calendar Draft
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (section.title === "System") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {auditChecks.map((check) => (
            <LightCard key={check.label} title={check.label} eyebrow="Audit" meta={check.status} compact={compact}>
              {check.detail}
            </LightCard>
          ))}
          <LightCard title="AI Organize / Import" eyebrow="Smart Capture">
            <div className="grid gap-3">
              <textarea value={aiInput} onChange={(event) => setAiInput(event.target.value)} placeholder="Paste a messy note, link, travel detail, project idea, or task..." className="min-h-28 rounded-md border border-ink/10 bg-white px-3 py-3 text-sm outline-none focus:border-clay focus:ring-4 focus:ring-clay/10" />
              <button type="button" onClick={() => void organizeWithAi()} className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper hover:bg-moss">
                <Brain size={16} aria-hidden="true" />
                Organize Into MatthewOS
              </button>
              {aiResult ? <p className="text-sm text-ink/55">{aiResult}</p> : null}
            </div>
          </LightCard>
          <LightCard title="Calendar Write-Back" eyebrow="Staged">
            Calendar write-back is currently implemented as D1 calendar drafts. A future provider can push these drafts to Apple, Google, or another calendar API once write credentials are configured.
          </LightCard>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        <LightCard title="Profile" eyebrow="Settings">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              updateSettings({
                ...settings,
                displayName: String(formData.get("displayName") || settings.displayName),
                weatherLocation: String(formData.get("weatherLocation") || settings.weatherLocation),
                defaultSection: String(formData.get("defaultSection") || settings.defaultSection) as DashboardSectionKey,
                compactCards: formData.get("compactCards") === "on"
              });
            }}
            className="grid gap-3"
          >
            <input name="displayName" defaultValue={settings.displayName} className="rounded-md border border-ink/10 bg-white px-3 py-3 text-sm" />
            <input name="weatherLocation" defaultValue={settings.weatherLocation} className="rounded-md border border-ink/10 bg-white px-3 py-3 text-sm" />
            <select name="defaultSection" defaultValue={settings.defaultSection} className="rounded-md border border-ink/10 bg-white px-3 py-3 text-sm">
              {osNavigation.map((item) => <option key={item.label}>{item.label}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm font-medium text-ink/70">
              <input name="compactCards" type="checkbox" defaultChecked={settings.compactCards} />
              Compact cards
            </label>
            <button type="submit" className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper hover:bg-moss">Save Settings</button>
          </form>
        </LightCard>
        <SystemStatusCard />
      </div>
    );
  }

  function SystemStatusCard() {
    const rows = [
      ["D1 data", dataStatus],
      ["R2 documents", documentStatus],
      ["Apple Calendar", calendarConnection],
      ["Weather", weatherConnection]
    ] as const;

    return (
      <LightCard title="System Status" eyebrow="Connections">
        <div className="grid gap-3">
          {rows.map(([label, state]) => (
            <div key={label} className="flex items-center justify-between rounded-md bg-mist/70 px-3 py-2">
              <span>{label}</span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">
                <StatusDot state={state} />
                {state}
              </span>
            </div>
          ))}
        </div>
      </LightCard>
    );
  }

  function DashboardNav({ compactNav = false }: { compactNav?: boolean }) {
    return (
      <nav className={compactNav ? "grid max-h-[70vh] gap-1 overflow-y-auto" : "mt-4 grid gap-1"}>
        {osNavigation.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setActiveSection(item.label);
              setMobileNavOpen(false);
            }}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition ${
              activeSection === item.label ? "bg-ink text-paper shadow-sm" : "text-ink/65 hover:bg-mist hover:text-ink"
            }`}
          >
            <item.icon size={16} aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </nav>
    );
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadSelectedDocument(file);
          event.currentTarget.value = "";
        }}
      />

      {commandOpen ? (
        <div className="fixed inset-0 z-50 bg-ink/30 px-4 py-10 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl rounded-lg border border-ink/10 bg-paper p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-clay">Command Center</p>
              <button type="button" onClick={() => setCommandOpen(false)} className="rounded-md p-2 text-ink/55 hover:bg-mist">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                executeCommand();
              }}
              className="mt-4 grid gap-3"
            >
              <input
                value={commandText}
                onChange={(event) => setCommandText(event.target.value)}
                autoFocus
                placeholder="Try: Add mortgage portal to Finance, or Create task call vendor Friday"
                className="rounded-md border border-ink/10 bg-white px-4 py-4 text-base outline-none focus:border-clay focus:ring-4 focus:ring-clay/10"
              />
              <button type="submit" className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper hover:bg-moss">Run Command</button>
            </form>
          </div>
        </div>
      ) : null}

      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-ink/10 bg-white/62 p-4 backdrop-blur lg:block">
          <div className="rounded-lg border border-ink/10 bg-paper p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Private</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">MatthewOS</h1>
            <p className="mt-2 text-sm leading-6 text-ink/55">A lighter personal operating system with editable sections and live integrations.</p>
          </div>
          <DashboardNav />
        </aside>

        <section className="p-4 pb-24 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 lg:hidden">
                <button type="button" onClick={() => setMobileNavOpen(true)} className="rounded-md border border-ink/10 bg-white px-3 py-3 text-ink/70">
                  <Menu size={18} aria-hidden="true" />
                </button>
                <p className="font-semibold">MatthewOS</p>
              </div>
              <label className="relative block w-full md:max-w-2xl">
                <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search notes, tasks, documents, trips, and links..."
                  className="w-full rounded-md border border-ink/10 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-clay focus:ring-4 focus:ring-clay/10"
                />
              </label>
              <button type="button" onClick={() => setCommandOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink/65 shadow-sm hover:bg-mist">
                <Command size={16} aria-hidden="true" />
                Cmd+K
              </button>
            </div>

            {mobileNavOpen ? (
              <div className="fixed inset-0 z-40 bg-ink/25 p-4 backdrop-blur-sm lg:hidden">
                <div className="rounded-lg border border-ink/10 bg-paper p-4 shadow-soft">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-semibold">Navigate</p>
                    <button type="button" onClick={() => setMobileNavOpen(false)} className="rounded-md p-2 hover:bg-mist">
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>
                  <DashboardNav compactNav />
                </div>
              </div>
            ) : null}

            {searchResults.length ? (
              <section className="mt-4 rounded-lg border border-ink/10 bg-white/82 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Search Results</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {searchResults.map((result) => (
                    <button key={`${result.type}-${result.title}`} type="button" className="rounded-md bg-mist/70 p-3 text-left text-sm hover:bg-mist">
                      <span className="font-semibold text-ink">{result.title}</span>
                      <span className="mt-1 block text-ink/55">{result.type} / {result.detail}</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-5 rounded-lg border border-ink/10 bg-white/82 p-5 shadow-sm">
              <form onSubmit={handleComposerSubmit} className="grid gap-3 lg:grid-cols-[190px_1fr_auto] lg:items-center">
                <select value={composerMode} onChange={(event) => setComposerMode(event.target.value as ComposerMode)} className="rounded-md border border-ink/10 bg-white px-3 py-3 text-sm font-semibold outline-none">
                  {Object.entries(composerLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <input ref={captureInputRef} value={capture} onChange={(event) => setCapture(event.target.value)} placeholder="Add a note, task, document, trip, project, or bookmark..." className="min-h-11 rounded-md border border-ink/10 bg-white px-4 text-sm outline-none focus:border-clay focus:ring-4 focus:ring-clay/10" />
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper hover:bg-moss">
                  <Plus size={16} aria-hidden="true" />
                  Save
                </button>
              </form>
              <p className="mt-3 text-sm text-ink/55">{activity}</p>
            </section>

            {activeSection === "Today" ? (
              <>
                <section className="mt-6 rounded-lg border border-ink/10 bg-white/82 p-6 shadow-crisp">
                  <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay">Daily Brief</p>
                      <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{getGreeting()}, {settings.displayName}</h2>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Pill>{getDateLabel()}</Pill>
                        <Pill>{weather ? `${weather.location} / ${weather.temperature}${weather.units.temperature} / ${weather.condition}` : weatherStatus}</Pill>
                        <Pill>{openTasks} open tasks</Pill>
                        <Pill>{monthlyHabitAverage}% habit progress</Pill>
                      </div>
                      <p className="mt-5 max-w-2xl text-sm leading-6 text-ink/66">
                        Today has {events.slice(0, 3).length} events, {todayTasks.length} top tasks, {todayHabitCheckins} habit check-ins, {documents.length} document records, and {trips.length} trips in the planning system.
                      </p>
                      <form onSubmit={handleWeatherSubmit} className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
                        <input value={weatherLocation} onChange={(event) => setWeatherLocation(event.target.value)} placeholder="Weather location" className="w-full rounded-md border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-clay focus:ring-4 focus:ring-clay/10" />
                        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/10 bg-mist px-4 py-3 text-sm font-semibold text-ink/70 hover:bg-white">
                          <RefreshCw size={15} aria-hidden="true" />
                          Update Weather
                        </button>
                      </form>
                      <p className="mt-2 text-xs text-ink/45">
                        {weather ? `Feels like ${weather.feelsLike}${weather.units.temperature}, wind ${weather.windSpeed} ${weather.units.windSpeed}, precipitation ${weather.precipitation} in.` : weatherStatus}
                      </p>
                    </div>
                    <div className="grid gap-3">
                      <LightCard title="Today's Calendar" eyebrow="Preview">
                        <ul className="space-y-2">
                          {events.slice(0, 3).map((event) => <li key={event.id}>{event.time} / {event.title}</li>)}
                        </ul>
                        <button type="button" onClick={() => void loadCalendar({ refresh: true })} className="mt-3 inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2 text-xs font-semibold text-ink/60 hover:bg-mist">
                          <CalendarDays size={14} aria-hidden="true" />
                          Resync Calendar
                        </button>
                        <p className="mt-2 text-xs text-ink/45">{calendarStatus}</p>
                      </LightCard>
                      <LightCard title="System Status" eyebrow="Connections">
                        <div className="grid gap-2">
                          {[
                            ["D1", dataStatus],
                            ["R2", documentStatus],
                            ["Calendar", calendarConnection],
                            ["Weather", weatherConnection]
                          ].map(([label, state]) => (
                            <div key={label} className="flex items-center justify-between rounded-md bg-mist/70 px-3 py-2">
                              <span>{label}</span>
                              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">
                                <StatusDot state={state as ConnectionState} />
                                {state}
                              </span>
                            </div>
                          ))}
                        </div>
                      </LightCard>
                    </div>
                  </div>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <LightCard title="Recent Notes" eyebrow="Knowledge">{recentNotes.map((note) => note.title).join(" / ")}</LightCard>
                  <LightCard title="Habit Tracker" eyebrow="Month">{habits.map((habit) => `${habit.title}: ${getHabitProgress(habit).percentage}%`).join(" / ")}</LightCard>
                  <LightCard title="Upcoming Trips" eyebrow="Travel">{trips.map((trip) => trip.destination).join(" / ")}</LightCard>
                  <LightCard title="Home Projects" eyebrow="Home">{projects.filter((project) => project.area === "Home").map((project) => project.title).join(" / ")}</LightCard>
                  <LightCard title="Recent Documents" eyebrow="Files">{documents.slice(0, 3).map((document) => document.title).join(" / ")}</LightCard>
                  <LightCard title="Universal Search" eyebrow="Working">Search filters across notes, tasks, documents, trips, bookmarks, and editable section items.</LightCard>
                  <LightCard title="Command Center" eyebrow="Cmd+K">Use the command button to add items into sections with natural language.</LightCard>
                  <a href="/dashboard/health" className="text-left">
                    <LightCard title="Health Dashboard" eyebrow="Private Module">Track workouts, meals, groceries, pantry, body metrics, progress photos, reminders, and wedding health goals.</LightCard>
                  </a>
                  <a href="/dashboard/westwall" className="text-left">
                    <LightCard title="WestWall Display" eyebrow="Private Module">Manage the ESP32-S3 HUB75 matrix display, rotation screens, device token, commands, and preview.</LightCard>
                  </a>
                </section>

                <section className="mt-6 rounded-lg border border-ink/10 bg-white/82 p-5 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => {
                      const mode: ComposerMode = action === "New Task" ? "task" : action === "Add Habit" ? "habit" : action === "Upload Document" ? "document" : action === "Add Trip" ? "trip" : action === "Add Home Project" ? "project" : action === "Add Bookmark" ? "bookmark" : "note";
                      return (
                        <button key={action} type="button" onClick={() => openComposer(mode)} className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-mist/60 px-3 py-2 text-sm font-semibold text-ink/65 hover:bg-white">
                          {action.includes("Upload") ? <UploadCloud size={16} /> : <FilePlus2 size={16} />}
                          {action}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {featureSections.map((section) => (
                    <button key={section.title} type="button" onClick={() => setActiveSection(section.title)} className="text-left">
                      <LightCard title={section.title} eyebrow="Section">{section.description}</LightCard>
                    </button>
                  ))}
                </section>
              </>
            ) : activeFeature ? (
              <section className="mt-6 space-y-5">
                <SectionHeader section={activeFeature} onAdd={() => openComposer(activeFeature.title === "Documents" ? "document" : activeFeature.title === "Tasks" ? "task" : activeFeature.title === "Habits" ? "habit" : activeFeature.title === "Travel" ? "trip" : "note")} />
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <LightCard title="Section Contents" eyebrow="Scaffold">
                    <ul className="space-y-2">
                      {activeFeature.items.map((item) => <li key={item} className="rounded-md bg-mist/70 px-3 py-2">{item}</li>)}
                    </ul>
                  </LightCard>
                  <LightCard title="Data Source" eyebrow="D1 + R2">
                    This section is now editable in the interface. Tasks, notes, and documents use D1/R2 APIs; other sections are staged for the same persistence layer.
                  </LightCard>
                </div>
                {renderSectionContent(activeFeature)}
              </section>
            ) : null}
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 px-3 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-2">
          {(["Today", "Tasks", "Habits", "Documents", "Settings"] as DashboardSectionKey[]).map((section) => (
            <button key={section} type="button" onClick={() => setActiveSection(section)} className={`rounded-md px-2 py-2 text-xs font-semibold ${activeSection === section ? "bg-ink text-paper" : "text-ink/60"}`}>
              {section === "Settings" ? <Settings2 size={16} className="mx-auto mb-1" aria-hidden="true" /> : null}
              {section}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
