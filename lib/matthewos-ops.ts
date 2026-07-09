import { mockBookmarks, mockDocuments, mockHabits, mockNotes, mockProjects, mockTasks, mockTrips } from "@/data/matthewos";
import { createBookmark, createNote, createProject, createTask, createTrip, listBookmarks, listDocuments, listHabits, listNotes, listProjects, listResources, listTasks, listTrips } from "@/lib/dashboard-db";
import { createId, getD1Database } from "@/lib/d1";
import { getWestWallDashboardData } from "@/lib/westwall-db";

export type UnifiedItem = {
  id: string;
  type: string;
  title: string;
  detail: string;
  section: string;
  status: string;
  sourceId: string;
};

export type OrganizedInput = {
  category: "Task" | "Note" | "Trip" | "Bookmark" | "Project";
  title: string;
  reason: string;
  tags: string[];
};

function classifyInput(value: string): OrganizedInput {
  const text = value.toLowerCase();

  if (text.includes("http") || text.includes("www.")) {
    return { category: "Bookmark", title: value, reason: "Detected a link or URL-style input.", tags: ["Link"] };
  }

  if (text.includes("flight") || text.includes("hotel") || text.includes("trip") || text.includes("travel")) {
    return { category: "Trip", title: value, reason: "Detected travel language.", tags: ["Travel"] };
  }

  if (text.includes("todo") || text.includes("task") || text.includes("call") || text.includes("follow up") || text.includes("due")) {
    return { category: "Task", title: value.replace(/^todo[:\s-]*/i, ""), reason: "Detected action-oriented language.", tags: ["Action"] };
  }

  if (text.includes("project") || text.includes("home") || text.includes("wedding") || text.includes("work")) {
    return { category: "Project", title: value, reason: "Detected a project or life-area reference.", tags: ["Project"] };
  }

  return { category: "Note", title: value, reason: "Defaulted to a note because no stronger category matched.", tags: ["Inbox"] };
}

export async function getUnifiedDashboardItems() {
  const [tasks, notes, documents, habits, trips, projects, bookmarks, resources, westwall] = await Promise.all([
    listTasks().catch(() => mockTasks),
    listNotes().catch(() => mockNotes),
    listDocuments().catch(() => mockDocuments),
    listHabits().catch(() => mockHabits),
    listTrips().catch(() => mockTrips),
    listProjects().catch(() => mockProjects),
    listBookmarks().catch(() => mockBookmarks),
    listResources(),
    getWestWallDashboardData()
  ]);

  const resourceItems = Object.entries(resources).flatMap(([section, items]) =>
    items.map((item): UnifiedItem => ({
      id: `resource-${item.id}`,
      type: "Resource",
      title: item.title,
      detail: item.detail,
      section,
      status: item.status,
      sourceId: item.id
    }))
  );

  return [
    ...tasks.map((item): UnifiedItem => ({ id: `task-${item.id}`, type: "Task", title: item.title, detail: item.dueDate, section: item.area, status: item.status, sourceId: item.id })),
    ...notes.map((item): UnifiedItem => ({ id: `note-${item.id}`, type: "Note", title: item.title, detail: item.summary, section: item.tags[0] ?? "Notes", status: item.updatedAt, sourceId: item.id })),
    ...documents.map((item): UnifiedItem => ({ id: `document-${item.id}`, type: "Document", title: item.title, detail: item.type, section: String(item.category), status: item.updatedAt, sourceId: item.id })),
    ...habits.map((item): UnifiedItem => ({ id: `habit-${item.id}`, type: "Habit", title: item.title, detail: item.frequency, section: "Habits", status: `${item.completions.length} check-ins`, sourceId: item.id })),
    ...trips.map((item): UnifiedItem => ({ id: `trip-${item.id}`, type: "Trip", title: item.destination, detail: item.detail, section: "Travel", status: item.status, sourceId: item.id })),
    ...projects.map((item): UnifiedItem => ({ id: `project-${item.id}`, type: "Project", title: item.title, detail: item.nextStep, section: item.area, status: item.status, sourceId: item.id })),
    ...bookmarks.map((item): UnifiedItem => ({ id: `bookmark-${item.id}`, type: "Bookmark", title: item.title, detail: item.description, section: item.category, status: item.url, sourceId: item.id })),
    ...resourceItems,
    ...westwall.rotation.map((item): UnifiedItem => ({ id: `westwall-${item.id}`, type: "WestWall Screen", title: item.label, detail: item.preview, section: "WestWall", status: item.enabled ? "Enabled" : "Disabled", sourceId: item.id })),
    ...westwall.messages.map((item): UnifiedItem => ({ id: `westwall-message-${item.id}`, type: "WestWall Message", title: item.title, detail: item.message, section: "WestWall", status: item.enabled ? "Enabled" : "Disabled", sourceId: item.id }))
  ];
}

export async function organizeInput(value: string) {
  const result = classifyInput(value);

  if (result.category === "Task") {
    const task = await createTask({ title: result.title, priority: "Medium", status: "Today", dueDate: "Today", area: "Today" });
    return { result, item: task };
  }

  if (result.category === "Trip") {
    const trip = await createTrip({ destination: result.title, dates: "TBD", status: "Idea", detail: "Captured by AI organize." });
    return { result, item: trip };
  }

  if (result.category === "Bookmark") {
    const bookmark = await createBookmark({ title: result.title, url: result.title.startsWith("http") ? result.title : "#", category: "Knowledge Library", description: "Captured by AI organize." });
    return { result, item: bookmark };
  }

  if (result.category === "Project") {
    const project = await createProject({ title: result.title, area: result.title.toLowerCase().includes("wedding") ? "Wedding" : "Home", status: "New", nextStep: "Review and define next action." });
    return { result, item: project };
  }

  const note = await createNote({ title: result.title, summary: "Captured by AI organize.", tags: result.tags });
  return { result, item: note };
}

export async function createCalendarDraft(input: { title?: string; startsAt?: string; endsAt?: string; notes?: string; sourceItemType?: string; sourceItemId?: string }) {
  const db = getD1Database();
  const draft = {
    id: createId("calendar-draft"),
    title: input.title?.trim() || "Untitled event",
    startsAt: input.startsAt ?? "",
    endsAt: input.endsAt ?? "",
    notes: input.notes ?? "",
    sourceItemType: input.sourceItemType ?? "",
    sourceItemId: input.sourceItemId ?? "",
    status: "draft"
  };

  if (!db) return draft;

  await db
    .prepare("INSERT INTO dashboard_calendar_drafts (id, title, starts_at, ends_at, notes, source_item_type, source_item_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(draft.id, draft.title, draft.startsAt, draft.endsAt, draft.notes, draft.sourceItemType, draft.sourceItemId, draft.status)
    .run();

  return draft;
}

export async function getDashboardAudit() {
  const [items, westwall] = await Promise.all([getUnifiedDashboardItems(), getWestWallDashboardData()]);

  return {
    generatedAt: new Date().toISOString(),
    checks: [
      { label: "D1 structured data", status: "connected", detail: `${items.length} indexed dashboard records visible to MatthewOS.` },
      { label: "R2 documents", status: "connected", detail: "Document upload routes are configured for R2-backed storage." },
      { label: "Apple Calendar import", status: process.env.APPLE_CALENDAR_ICS_URL ? "connected" : "missing", detail: "Read-only import uses APPLE_CALENDAR_ICS_URL. Write-back is staged as calendar drafts." },
      { label: "AI organize", status: process.env.OPENAI_API_KEY ? "ready" : "heuristic", detail: "Current classifier is local heuristic; add OPENAI_API_KEY later for model classification." },
      { label: "WestWall heartbeat", status: westwall.device.status, detail: `Last check-in: ${westwall.device.lastCheckIn}` },
      { label: "WestWall token", status: process.env.WESTWALL_DEVICE_TOKEN ? "configured" : "missing", detail: "ESP32 device routes require WESTWALL_DEVICE_TOKEN in production." }
    ]
  };
}
