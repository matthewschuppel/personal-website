import {
  mockDocuments,
  mockHabits,
  mockNotes,
  mockBookmarks,
  mockProjects,
  mockTrips,
  mockTasks,
  financeResources,
  homeResources,
  knowledgeResources,
  photographyResources,
  weddingResources,
  workResources,
  type DashboardSectionKey,
  type MockBookmark,
  type MockDocument,
  type MockHabit,
  type MockNote,
  type MockProject,
  type MockResource,
  type MockTask,
  type MockTrip
} from "@/data/matthewos";
import { createId, getD1Database } from "@/lib/d1";
import { getR2Bucket } from "@/lib/r2-storage";

type TaskRow = {
  id: string;
  title: string;
  notes: string | null;
  priority: "High" | "Medium" | "Low";
  status: "Today" | "Next" | "Waiting" | "Done";
  due_date: string | null;
  area: MockTask["area"];
  updated_at: string;
};

type NoteRow = {
  id: string;
  title: string;
  body: string | null;
  tags: string | null;
  updated_at: string;
};

type DocumentRow = {
  id: string;
  title: string;
  category: MockDocument["category"] | null;
  r2_key: string;
  content_type: string | null;
  size_bytes: number | null;
  updated_at: string;
};

type HabitRow = {
  id: string;
  title: string;
  frequency: MockHabit["frequency"];
  color: MockHabit["color"] | null;
  completions: string | null;
  updated_at: string;
};

type TripRow = {
  id: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  itinerary_notes: string | null;
  updated_at: string;
};

type BookmarkRow = {
  id: string;
  title: string;
  url: string;
  category: MockBookmark["category"] | null;
  notes: string | null;
  updated_at: string;
};

type ProjectRow = {
  id: string;
  title: string;
  area: MockProject["area"];
  status: string | null;
  next_step: string | null;
  updated_at: string;
};

type ResourceRow = {
  id: string;
  section: ResourceKey;
  title: string;
  detail: string | null;
  status: string | null;
  updated_at: string;
};

export type ResourceKey = "Home" | "Work" | "Photography" | "Wedding" | "Finance" | "Knowledge Library";
export type ResourceGroups = Record<ResourceKey, MockResource[]>;

export type DashboardSettingsData = {
  displayName: string;
  weatherLocation: string;
  defaultSection: DashboardSectionKey;
  compactCards: boolean;
};

export const defaultDashboardSettings: DashboardSettingsData = {
  displayName: "Matthew",
  weatherLocation: "Corinth, TX",
  defaultSection: "Today",
  compactCards: false
};

export const resourceSeed: ResourceGroups = {
  Home: homeResources,
  Work: workResources,
  Photography: photographyResources,
  Wedding: weddingResources,
  Finance: financeResources,
  "Knowledge Library": knowledgeResources
};

function toTask(row: TaskRow): MockTask {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date ?? "Unscheduled",
    area: row.area
  };
}

function toNote(row: NoteRow): MockNote {
  let tags: string[] = [];

  try {
    tags = row.tags ? JSON.parse(row.tags) as string[] : [];
  } catch {
    tags = [];
  }

  return {
    id: row.id,
    title: row.title,
    summary: row.body ?? "",
    tags,
    updatedAt: row.updated_at
  };
}

function toDocument(row: DocumentRow): MockDocument {
  return {
    id: row.id,
    title: row.title,
    category: row.category ?? "Documents",
    type: row.content_type ?? "File",
    updatedAt: row.updated_at,
    owner: "Matthew"
  };
}

function toHabit(row: HabitRow): MockHabit {
  return {
    id: row.id,
    title: row.title,
    frequency: row.frequency,
    color: row.color ?? "moss",
    completions: row.completions ? row.completions.split(",").filter(Boolean) : []
  };
}

function toTrip(row: TripRow): MockTrip {
  const dates = row.start_date && row.end_date ? `${row.start_date} to ${row.end_date}` : row.start_date ?? "TBD";

  return {
    id: row.id,
    destination: row.destination,
    dates,
    status: row.status ?? "Planning",
    detail: row.itinerary_notes ?? "Trip details ready for notes."
  };
}

function toBookmark(row: BookmarkRow): MockBookmark {
  return {
    id: row.id,
    title: row.title,
    category: row.category ?? "Knowledge Library",
    url: row.url,
    description: row.notes ?? "Saved dashboard bookmark."
  };
}

function toProject(row: ProjectRow): MockProject {
  return {
    id: row.id,
    title: row.title,
    area: row.area,
    status: row.status ?? "New",
    nextStep: row.next_step ?? "Define next action."
  };
}

function toResource(row: ResourceRow): MockResource {
  return {
    id: row.id,
    title: row.title,
    detail: row.detail ?? "Add details later.",
    status: row.status ?? "New"
  };
}

function groupResources(rows: ResourceRow[]): ResourceGroups {
  const grouped: ResourceGroups = {
    Home: [],
    Work: [],
    Photography: [],
    Wedding: [],
    Finance: [],
    "Knowledge Library": []
  };

  for (const row of rows) {
    if (row.section in grouped) {
      grouped[row.section].push(toResource(row));
    }
  }

  return {
    Home: grouped.Home.length ? grouped.Home : resourceSeed.Home,
    Work: grouped.Work.length ? grouped.Work : resourceSeed.Work,
    Photography: grouped.Photography.length ? grouped.Photography : resourceSeed.Photography,
    Wedding: grouped.Wedding.length ? grouped.Wedding : resourceSeed.Wedding,
    Finance: grouped.Finance.length ? grouped.Finance : resourceSeed.Finance,
    "Knowledge Library": grouped["Knowledge Library"].length ? grouped["Knowledge Library"] : resourceSeed["Knowledge Library"]
  };
}

function getDbOrNull() {
  return getD1Database();
}

export async function listTasks() {
  const db = getDbOrNull();

  if (!db) {
    return mockTasks;
  }

  const { results = [] } = await db
    .prepare("SELECT id, title, notes, priority, status, due_date, area, updated_at FROM tasks ORDER BY updated_at DESC")
    .all<TaskRow>();

  return results.length ? results.map(toTask) : mockTasks;
}

export async function createTask(input: Partial<MockTask>) {
  const db = getDbOrNull();
  const task: MockTask = {
    id: input.id ?? createId("task"),
    title: input.title?.trim() || "Untitled task",
    priority: input.priority ?? "Medium",
    status: input.status ?? "Today",
    dueDate: input.dueDate ?? "Unscheduled",
    area: input.area ?? "Today"
  };

  if (!db) {
    return task;
  }

  await db
    .prepare(
      "INSERT INTO tasks (id, title, notes, priority, status, due_date, area, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
    )
    .bind(task.id, task.title, null, task.priority, task.status, task.dueDate, task.area)
    .run();

  return task;
}

export async function updateTask(id: string, input: Partial<MockTask>) {
  const db = getDbOrNull();

  if (!db) {
    return { id, ...input };
  }

  const existing = await db
    .prepare("SELECT id, title, notes, priority, status, due_date, area, updated_at FROM tasks WHERE id = ?")
    .bind(id)
    .first<TaskRow>();

  if (!existing) {
    return null;
  }

  const next = {
    ...toTask(existing),
    ...input,
    id
  };

  await db
    .prepare("UPDATE tasks SET title = ?, priority = ?, status = ?, due_date = ?, area = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(next.title, next.priority, next.status, next.dueDate, next.area, id)
    .run();

  return next;
}

export async function deleteTask(id: string) {
  const db = getDbOrNull();

  if (!db) {
    return true;
  }

  await db.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
  return true;
}

export async function listHabits() {
  const db = getDbOrNull();

  if (!db) {
    return mockHabits;
  }

  try {
    const { results = [] } = await db
      .prepare(
        `SELECT habits.id, habits.title, habits.frequency, habits.color, habits.updated_at,
          GROUP_CONCAT(habit_checkins.completed_on) AS completions
        FROM habits
        LEFT JOIN habit_checkins ON habit_checkins.habit_id = habits.id
        GROUP BY habits.id
        ORDER BY habits.updated_at DESC`
      )
      .all<HabitRow>();

    return results.length ? results.map(toHabit) : mockHabits;
  } catch {
    return mockHabits;
  }
}

export async function createHabit(input: Partial<MockHabit>) {
  const db = getDbOrNull();
  const habit: MockHabit = {
    id: input.id ?? createId("habit"),
    title: input.title?.trim() || "Untitled habit",
    frequency: input.frequency ?? "Daily",
    color: input.color ?? "moss",
    completions: input.completions ?? []
  };

  if (!db) {
    return habit;
  }

  try {
    await db
      .prepare("INSERT INTO habits (id, title, frequency, color, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)")
      .bind(habit.id, habit.title, habit.frequency, habit.color)
      .run();
  } catch {
    return habit;
  }

  return habit;
}

export async function deleteHabit(id: string) {
  const db = getDbOrNull();

  if (!db) {
    return true;
  }

  try {
    await db.prepare("DELETE FROM habit_checkins WHERE habit_id = ?").bind(id).run();
    await db.prepare("DELETE FROM habits WHERE id = ?").bind(id).run();
  } catch {
    return true;
  }

  return true;
}

export async function toggleHabitCheckin(id: string, completedOn: string) {
  const db = getDbOrNull();

  if (!db) {
    return { id, completedOn };
  }

  try {
    const existing = await db
      .prepare("SELECT id FROM habit_checkins WHERE habit_id = ? AND completed_on = ?")
      .bind(id, completedOn)
      .first<{ id: string }>();

    if (existing) {
      await db.prepare("DELETE FROM habit_checkins WHERE id = ?").bind(existing.id).run();
      await db.prepare("UPDATE habits SET updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(id).run();
      return { id, completedOn, completed: false };
    }

    await db
      .prepare("INSERT INTO habit_checkins (id, habit_id, completed_on, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)")
      .bind(createId("checkin"), id, completedOn)
      .run();
    await db.prepare("UPDATE habits SET updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(id).run();
  } catch {
    return { id, completedOn };
  }

  return { id, completedOn, completed: true };
}

export async function listNotes() {
  const db = getDbOrNull();

  if (!db) {
    return mockNotes;
  }

  const { results = [] } = await db
    .prepare("SELECT id, title, body, tags, updated_at FROM notes ORDER BY updated_at DESC")
    .all<NoteRow>();

  return results.length ? results.map(toNote) : mockNotes;
}

export async function createNote(input: Partial<MockNote>) {
  const db = getDbOrNull();
  const note: MockNote = {
    id: input.id ?? createId("note"),
    title: input.title?.trim() || "Untitled note",
    summary: input.summary ?? "",
    tags: input.tags ?? ["Inbox"],
    updatedAt: "Just now"
  };

  if (!db) {
    return note;
  }

  await db
    .prepare("INSERT INTO notes (id, title, body, tags, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)")
    .bind(note.id, note.title, note.summary, JSON.stringify(note.tags))
    .run();

  return note;
}

export async function updateNote(id: string, input: Partial<MockNote>) {
  const db = getDbOrNull();

  if (!db) {
    return { id, ...input };
  }

  const existing = await db
    .prepare("SELECT id, title, body, tags, updated_at FROM notes WHERE id = ?")
    .bind(id)
    .first<NoteRow>();

  if (!existing) {
    return null;
  }

  const next = {
    ...toNote(existing),
    ...input,
    id
  };

  await db
    .prepare("UPDATE notes SET title = ?, body = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(next.title, next.summary, JSON.stringify(next.tags), id)
    .run();

  return next;
}

export async function deleteNote(id: string) {
  const db = getDbOrNull();

  if (!db) {
    return true;
  }

  await db.prepare("DELETE FROM notes WHERE id = ?").bind(id).run();
  return true;
}

export async function listTrips() {
  const db = getDbOrNull();

  if (!db) {
    return mockTrips;
  }

  try {
    const { results = [] } = await db
      .prepare("SELECT id, destination, start_date, end_date, status, itinerary_notes, updated_at FROM trips ORDER BY updated_at DESC")
      .all<TripRow>();

    return results.length ? results.map(toTrip) : mockTrips;
  } catch {
    return mockTrips;
  }
}

export async function createTrip(input: Partial<MockTrip>) {
  const db = getDbOrNull();
  const trip: MockTrip = {
    id: input.id ?? createId("trip"),
    destination: input.destination?.trim() || "Untitled trip",
    dates: input.dates ?? "TBD",
    status: input.status ?? "New",
    detail: input.detail ?? "New trip ready for flights, lodging, and notes."
  };

  if (!db) {
    return trip;
  }

  try {
    await db
      .prepare("INSERT INTO trips (id, destination, start_date, end_date, status, itinerary_notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)")
      .bind(trip.id, trip.destination, trip.dates === "TBD" ? null : trip.dates, null, trip.status, trip.detail)
      .run();
  } catch {
    return trip;
  }

  return trip;
}

export async function deleteTrip(id: string) {
  const db = getDbOrNull();

  if (!db) {
    return true;
  }

  try {
    await db.prepare("DELETE FROM trips WHERE id = ?").bind(id).run();
  } catch {
    return true;
  }

  return true;
}

export async function listBookmarks() {
  const db = getDbOrNull();

  if (!db) {
    return mockBookmarks;
  }

  try {
    const { results = [] } = await db
      .prepare("SELECT id, title, url, category, notes, updated_at FROM bookmarks ORDER BY updated_at DESC")
      .all<BookmarkRow>();

    return results.length ? results.map(toBookmark) : mockBookmarks;
  } catch {
    return mockBookmarks;
  }
}

export async function createBookmark(input: Partial<MockBookmark>) {
  const db = getDbOrNull();
  const bookmark: MockBookmark = {
    id: input.id ?? createId("bookmark"),
    title: input.title?.trim() || "Untitled bookmark",
    category: input.category ?? "Knowledge Library",
    url: input.url?.trim() || "#",
    description: input.description ?? "Saved dashboard bookmark."
  };

  if (!db) {
    return bookmark;
  }

  try {
    await db
      .prepare("INSERT INTO bookmarks (id, title, url, category, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)")
      .bind(bookmark.id, bookmark.title, bookmark.url, bookmark.category, bookmark.description)
      .run();
  } catch {
    return bookmark;
  }

  return bookmark;
}

export async function deleteBookmark(id: string) {
  const db = getDbOrNull();

  if (!db) {
    return true;
  }

  try {
    await db.prepare("DELETE FROM bookmarks WHERE id = ?").bind(id).run();
  } catch {
    return true;
  }

  return true;
}

export async function listProjects() {
  const db = getDbOrNull();

  if (!db) {
    return mockProjects;
  }

  try {
    const { results = [] } = await db
      .prepare("SELECT id, title, area, status, next_step, updated_at FROM dashboard_projects ORDER BY updated_at DESC")
      .all<ProjectRow>();

    return results.length ? results.map(toProject) : mockProjects;
  } catch {
    return mockProjects;
  }
}

export async function createProject(input: Partial<MockProject>) {
  const db = getDbOrNull();
  const project: MockProject = {
    id: input.id ?? createId("project"),
    title: input.title?.trim() || "Untitled project",
    area: input.area ?? "Home",
    status: input.status ?? "New",
    nextStep: input.nextStep ?? "Define next action."
  };

  if (!db) {
    return project;
  }

  try {
    await db
      .prepare("INSERT INTO dashboard_projects (id, title, area, status, next_step, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)")
      .bind(project.id, project.title, project.area, project.status, project.nextStep)
      .run();
  } catch {
    return project;
  }

  return project;
}

export async function deleteProject(id: string) {
  const db = getDbOrNull();

  if (!db) {
    return true;
  }

  try {
    await db.prepare("DELETE FROM dashboard_projects WHERE id = ?").bind(id).run();
  } catch {
    return true;
  }

  return true;
}

export async function listResources() {
  const db = getDbOrNull();

  if (!db) {
    return resourceSeed;
  }

  try {
    const { results = [] } = await db
      .prepare("SELECT id, section, title, detail, status, updated_at FROM dashboard_resources ORDER BY updated_at DESC")
      .all<ResourceRow>();

    return results.length ? groupResources(results) : resourceSeed;
  } catch {
    return resourceSeed;
  }
}

export async function createResource(section: ResourceKey, input: Partial<MockResource>) {
  const db = getDbOrNull();
  const resource: MockResource = {
    id: input.id ?? createId("resource"),
    title: input.title?.trim() || "Untitled item",
    detail: input.detail ?? "New editable item. Add details later.",
    status: input.status ?? "New"
  };

  if (!db) {
    return resource;
  }

  try {
    await db
      .prepare("INSERT INTO dashboard_resources (id, section, title, detail, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)")
      .bind(resource.id, section, resource.title, resource.detail, resource.status)
      .run();
  } catch {
    return resource;
  }

  return resource;
}

export async function deleteResource(id: string) {
  const db = getDbOrNull();

  if (!db) {
    return true;
  }

  try {
    await db.prepare("DELETE FROM dashboard_resources WHERE id = ?").bind(id).run();
  } catch {
    return true;
  }

  return true;
}

export async function updateResource(id: string, input: Partial<MockResource>) {
  const db = getDbOrNull();
  const resource: MockResource = {
    id,
    title: input.title?.trim() || "Untitled item",
    detail: input.detail ?? "Add details later.",
    status: input.status ?? "Updated"
  };

  if (!db) {
    return resource;
  }

  try {
    await db
      .prepare("UPDATE dashboard_resources SET title = ?, detail = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(resource.title, resource.detail, resource.status, id)
      .run();
  } catch {
    return resource;
  }

  return resource;
}

export async function getDashboardSettings() {
  const db = getDbOrNull();

  if (!db) {
    return defaultDashboardSettings;
  }

  try {
    const row = await db
      .prepare("SELECT value FROM dashboard_settings WHERE key = ?")
      .bind("dashboard")
      .first<{ value: string }>();

    return row?.value ? { ...defaultDashboardSettings, ...JSON.parse(row.value) } as DashboardSettingsData : defaultDashboardSettings;
  } catch {
    return defaultDashboardSettings;
  }
}

export async function saveDashboardSettings(settings: DashboardSettingsData) {
  const db = getDbOrNull();
  const nextSettings = { ...defaultDashboardSettings, ...settings };

  if (!db) {
    return nextSettings;
  }

  try {
    await db
      .prepare(
        `INSERT INTO dashboard_settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
      )
      .bind("dashboard", JSON.stringify(nextSettings))
      .run();
  } catch {
    return nextSettings;
  }

  return nextSettings;
}

export async function listDocuments() {
  const db = getDbOrNull();

  if (!db) {
    return mockDocuments;
  }

  const { results = [] } = await db
    .prepare("SELECT id, title, category, r2_key, content_type, size_bytes, updated_at FROM documents ORDER BY updated_at DESC")
    .all<DocumentRow>();

  return results.length ? results.map(toDocument) : mockDocuments;
}

function getDocumentsBucket() {
  return getR2Bucket("DOCUMENTS_BUCKET", "DASHBOARD_BUCKET");
}

export async function uploadDocument(file: File, category = "Documents") {
  const db = getDbOrNull();
  const bucket = getDocumentsBucket();
  const id = createId("doc");
  const contentType = file.type || "application/octet-stream";
  const key = `documents/${id}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;

  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType }
  });

  if (db) {
    await db
      .prepare(
        "INSERT INTO documents (id, title, category, r2_key, content_type, size_bytes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
      )
      .bind(id, file.name, category, key, contentType, file.size)
      .run();
  }

  return {
    id,
    title: file.name,
    category: category as MockDocument["category"],
    type: contentType,
    updatedAt: "Just now",
    owner: "Matthew"
  };
}

export async function deleteDocument(id: string) {
  const db = getDbOrNull();

  if (!db) {
    return true;
  }

  const existing = await db
    .prepare("SELECT r2_key FROM documents WHERE id = ?")
    .bind(id)
    .first<{ r2_key: string }>();

  if (existing?.r2_key) {
    await getDocumentsBucket().delete(existing.r2_key);
  }

  await db.prepare("DELETE FROM documents WHERE id = ?").bind(id).run();
  return true;
}

export async function getDocumentObject(id: string) {
  const db = getDbOrNull();

  if (!db) {
    return null;
  }

  const existing = await db
    .prepare("SELECT title, r2_key, content_type FROM documents WHERE id = ?")
    .bind(id)
    .first<{ title: string; r2_key: string; content_type: string | null }>();

  if (!existing?.r2_key) {
    return null;
  }

  const object = await getDocumentsBucket().get(existing.r2_key);

  if (!object) {
    return null;
  }

  return {
    object,
    title: existing.title,
    contentType: existing.content_type ?? object.httpMetadata?.contentType ?? "application/octet-stream"
  };
}
