import {
  mockDocuments,
  mockHabits,
  mockNotes,
  mockTasks,
  type MockDocument,
  type MockHabit,
  type MockNote,
  type MockTask
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
