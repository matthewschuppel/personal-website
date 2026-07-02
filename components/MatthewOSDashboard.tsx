"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Command,
  FilePlus2,
  Plus,
  Search,
  Trash2,
  UploadCloud
} from "lucide-react";
import {
  financeResources,
  featureSections,
  homeResources,
  knowledgeResources,
  mockBookmarks,
  mockDocuments,
  mockEvents,
  mockGalleryItems,
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
  type MockEvent,
  type MockNote,
  type MockProject,
  type MockResource,
  type MockTask,
  type MockTrip
} from "@/data/matthewos";

type DatabaseCardProps = {
  title: string;
  eyebrow?: string;
  meta?: string;
  children?: ReactNode;
};

type ComposerMode = "note" | "task" | "document" | "trip" | "project" | "bookmark";

const composerLabels: Record<ComposerMode, string> = {
  note: "New Note",
  task: "New Task",
  document: "Upload Document",
  trip: "Add Trip",
  project: "Add Home Project",
  bookmark: "Add Bookmark"
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  if (hour < 22) {
    return "Good Evening";
  }

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

function classifyCapture(value: string): ComposerMode {
  const text = value.toLowerCase();

  if (text.includes("task") || text.includes("todo") || text.includes("call") || text.includes("follow up")) {
    return "task";
  }

  if (text.includes("trip") || text.includes("flight") || text.includes("hotel") || text.includes("travel")) {
    return "trip";
  }

  if (text.includes("upload") || text.includes("pdf") || text.includes("document") || text.includes("file")) {
    return "document";
  }

  if (text.includes("http") || text.includes("link") || text.includes("bookmark")) {
    return "bookmark";
  }

  if (text.includes("project") || text.includes("home")) {
    return "project";
  }

  return "note";
}

function DatabaseCard({ title, eyebrow, meta, children }: DatabaseCardProps) {
  return (
    <article className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 font-semibold text-stone-950 dark:text-stone-50">{title}</h3>
        </div>
        {meta ? (
          <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-500 dark:bg-stone-800 dark:text-stone-300">
            {meta}
          </span>
        ) : null}
      </div>
      {children ? <div className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">{children}</div> : null}
    </article>
  );
}

function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
      {children}
    </span>
  );
}

function SectionHeader({ section }: { section: FeatureSection }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">MatthewOS Database</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
        {section.title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">{section.description}</p>
    </div>
  );
}

function ResourceGrid({ resources }: { resources: MockResource[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {resources.map((resource) => (
        <DatabaseCard key={resource.id} title={resource.title} eyebrow="Resource" meta={resource.status}>
          {resource.detail}
        </DatabaseCard>
      ))}
    </div>
  );
}

export function MatthewOSDashboard() {
  const [activeSection, setActiveSection] = useState<DashboardSectionKey>("Today");
  const [query, setQuery] = useState("");
  const [capture, setCapture] = useState("");
  const [composerMode, setComposerMode] = useState<ComposerMode>("note");
  const captureInputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState<MockNote[]>(mockNotes);
  const [tasks, setTasks] = useState<MockTask[]>(mockTasks);
  const [documents, setDocuments] = useState<MockDocument[]>(mockDocuments);
  const [trips, setTrips] = useState<MockTrip[]>(mockTrips);
  const [projects, setProjects] = useState<MockProject[]>(mockProjects);
  const [bookmarks, setBookmarks] = useState<MockBookmark[]>(mockBookmarks);
  const [events] = useState<MockEvent[]>(mockEvents);
  const [activity, setActivity] = useState("Demo mode: changes update this screen locally.");

  const activeFeature = featureSections.find((section) => section.title === activeSection);
  const todayTasks = tasks.filter((task) => task.status === "Today").slice(0, 3);
  const recentNotes = notes.slice(0, 3);
  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return [
      ...notes.map((item) => ({ type: "Note", title: item.title, detail: item.summary })),
      ...tasks.map((item) => ({ type: "Task", title: item.title, detail: `${item.area} / ${item.status}` })),
      ...documents.map((item) => ({ type: "Document", title: item.title, detail: `${item.category} / ${item.type}` })),
      ...trips.map((item) => ({ type: "Trip", title: item.destination, detail: item.detail })),
      ...bookmarks.map((item) => ({ type: "Bookmark", title: item.title, detail: item.description }))
    ]
      .filter((item) => `${item.type} ${item.title} ${item.detail}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [bookmarks, documents, notes, query, tasks, trips]);

  function openComposer(mode: ComposerMode, preset = "") {
    setComposerMode(mode);
    setCapture(preset);
  }

  function saveCapture() {
    const value = (captureInputRef.current?.value ?? capture).trim();

    if (!value) {
      setActivity("Type something first, then save it into MatthewOS.");
      return;
    }

    const mode = composerMode === "note" ? classifyCapture(value) : composerMode;
    const id = `${mode}-${Date.now()}`;

    if (mode === "task") {
      setTasks((current) => [
        {
          id,
          title: value,
          priority: "Medium",
          status: "Today",
          dueDate: "Today",
          area: "Today"
        },
        ...current
      ]);
      setActiveSection("Tasks");
    }

    if (mode === "note") {
      setNotes((current) => [
        {
          id,
          title: value,
          summary: "Captured from the MatthewOS quick add demo.",
          tags: ["Inbox"],
          updatedAt: "Just now"
        },
        ...current
      ]);
      setActiveSection("Notes");
    }

    if (mode === "document") {
      setDocuments((current) => [
        {
          id,
          title: value,
          category: "Documents",
          type: "Upload placeholder",
          updatedAt: "Just now",
          owner: "Matthew"
        },
        ...current
      ]);
      setActiveSection("Documents");
    }

    if (mode === "trip") {
      setTrips((current) => [
        {
          id,
          destination: value,
          dates: "TBD",
          status: "Idea",
          detail: "Captured trip idea ready for dates, flights, hotel, and itinerary notes."
        },
        ...current
      ]);
      setActiveSection("Travel");
    }

    if (mode === "project") {
      setProjects((current) => [
        {
          id,
          title: value,
          area: "Home",
          status: "New",
          nextStep: "Define the next action and attach supporting documents."
        },
        ...current
      ]);
      setActiveSection("Home");
    }

    if (mode === "bookmark") {
      setBookmarks((current) => [
        {
          id,
          title: value,
          category: "Knowledge Library",
          url: value.startsWith("http") ? value : "#",
          description: "Captured bookmark ready for a URL, tags, and summary."
        },
        ...current
      ]);
      setActiveSection("Knowledge Library");
    }

    setCapture("");
    if (captureInputRef.current) {
      captureInputRef.current.value = "";
    }
    setComposerMode("note");
    setActivity(`Saved "${value}" as ${composerLabels[mode].toLowerCase()}.`);
    // Future persistence: replace the local state update with D1 inserts and R2 upload flows.
  }

  function handleComposerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveCapture();
  }

  function completeTask(id: string) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status: "Done" } : task)));
    setActivity("Task marked done in the demo state.");
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
    setActivity("Task removed from the demo state.");
  }

  function renderTasks() {
    return (
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className={`font-semibold ${task.status === "Done" ? "text-stone-400 line-through" : "text-stone-950 dark:text-stone-50"}`}>
                {task.title}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusPill>{task.priority}</StatusPill>
                <StatusPill>{task.status}</StatusPill>
                <StatusPill>{task.dueDate}</StatusPill>
                <StatusPill>{task.area}</StatusPill>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => completeTask(task.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-900"
              >
                <Check size={15} aria-hidden="true" />
                Done
              </button>
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-900"
              >
                <Trash2 size={15} aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderSectionContent(section: FeatureSection) {
    if (section.title === "Notes") {
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <DatabaseCard key={note.id} title={note.title} eyebrow="Note" meta={note.updatedAt}>
              <p>{note.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <StatusPill key={tag}>{tag}</StatusPill>
                ))}
              </div>
            </DatabaseCard>
          ))}
        </div>
      );
    }

    if (section.title === "Tasks") {
      return renderTasks();
    }

    if (section.title === "Calendar") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <DatabaseCard key={event.id} title={event.title} eyebrow={event.calendar} meta={event.time}>
              Calendar preview data. Future integration can pull Apple or Google events into this same shape.
            </DatabaseCard>
          ))}
        </div>
      );
    }

    if (section.title === "Documents") {
      return (
        <div className="space-y-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="grid gap-3 rounded-xl border border-stone-200 bg-white p-4 text-sm shadow-sm dark:border-stone-800 dark:bg-stone-900 md:grid-cols-[1.4fr_0.8fr_0.6fr_0.7fr]"
            >
              <p className="font-semibold text-stone-950 dark:text-stone-50">{document.title}</p>
              <p>{document.category}</p>
              <p>{document.type}</p>
              <p>{document.updatedAt}</p>
            </div>
          ))}
        </div>
      );
    }

    if (section.title === "Travel") {
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trips.map((trip) => (
            <DatabaseCard key={trip.id} title={trip.destination} eyebrow={trip.status} meta={trip.dates}>
              {trip.detail}
            </DatabaseCard>
          ))}
        </div>
      );
    }

    if (section.title === "Home") {
      return (
        <div className="space-y-5">
          <ResourceGrid resources={homeResources} />
          <ResourceGrid resources={projects.filter((project) => project.area === "Home").map((project) => ({
            id: project.id,
            title: project.title,
            detail: project.nextStep,
            status: project.status
          }))} />
        </div>
      );
    }

    if (section.title === "Work") {
      return <ResourceGrid resources={workResources} />;
    }

    if (section.title === "Photography") {
      return (
        <div className="space-y-5">
          <ResourceGrid resources={photographyResources} />
          <div className="grid gap-4 md:grid-cols-2">
            {mockGalleryItems
              .filter((item) => item.album === "Photography")
              .map((item) => (
                <DatabaseCard key={item.id} title={item.title} eyebrow={item.album} meta={item.location}>
                  Future favorite photos can live in R2 and display here.
                </DatabaseCard>
              ))}
          </div>
        </div>
      );
    }

    if (section.title === "Wedding") {
      return (
        <div className="space-y-5">
          <ResourceGrid resources={weddingResources} />
          <ResourceGrid resources={projects.filter((project) => project.area === "Wedding").map((project) => ({
            id: project.id,
            title: project.title,
            detail: project.nextStep,
            status: project.status
          }))} />
        </div>
      );
    }

    if (section.title === "Finance") {
      return <ResourceGrid resources={financeResources} />;
    }

    if (section.title === "Knowledge Library") {
      return (
        <div className="space-y-5">
          <ResourceGrid resources={knowledgeResources} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {bookmarks.map((bookmark) => (
              <DatabaseCard key={bookmark.id} title={bookmark.title} eyebrow={bookmark.category}>
                <p>{bookmark.description}</p>
                <a href={bookmark.url} className="mt-3 inline-flex items-center gap-2 font-semibold text-stone-950 dark:text-stone-50">
                  Open link
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </DatabaseCard>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        <DatabaseCard title="Profile" eyebrow="Settings">
          Matthew, Dallas, Central time, neutral interface, private dashboard first.
        </DatabaseCard>
        <DatabaseCard title="Integrations" eyebrow="Future">
          Cloudflare Access, D1, R2, Apple Calendar, weather, AI search, and document analysis.
        </DatabaseCard>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-stone-200 bg-white/85 p-4 backdrop-blur dark:border-stone-800 dark:bg-stone-950/80 lg:border-b-0 lg:border-r">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Private</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">MatthewOS</h1>
            <p className="mt-2 text-sm leading-6 text-stone-500 dark:text-stone-400">
              Interactive demo mode with mock data. D1 and R2 persistence can be wired into these same views.
            </p>
          </div>
          <nav className="mt-4 grid gap-1">
            {osNavigation.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveSection(item.label)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  activeSection === item.label
                    ? "bg-stone-950 text-white shadow-sm dark:bg-stone-50 dark:text-stone-950"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-white"
                }`}
              >
                <item.icon size={16} aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="relative block w-full md:max-w-2xl">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  aria-hidden="true"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search notes, tasks, documents, trips, and links..."
                  className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:focus:ring-stone-800"
                />
              </label>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-600 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                <Command size={16} aria-hidden="true" />
                Cmd+K
              </button>
            </div>

            {searchResults.length ? (
              <section className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Search Results</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.title}`}
                      type="button"
                      className="rounded-lg bg-stone-50 p-3 text-left text-sm hover:bg-stone-100 dark:bg-stone-950 dark:hover:bg-stone-800"
                    >
                      <span className="font-semibold text-stone-950 dark:text-stone-50">{result.title}</span>
                      <span className="mt-1 block text-stone-500">{result.type} / {result.detail}</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <form onSubmit={handleComposerSubmit} className="grid gap-3 lg:grid-cols-[190px_1fr_auto] lg:items-center">
                <select
                  value={composerMode}
                  onChange={(event) => setComposerMode(event.target.value as ComposerMode)}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm font-semibold outline-none dark:border-stone-800 dark:bg-stone-950"
                >
                  {Object.entries(composerLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <input
                  ref={captureInputRef}
                  value={capture}
                  onChange={(event) => setCapture(event.target.value)}
                  placeholder="Add a note, task, document, trip, project, or bookmark..."
                  className="min-h-11 rounded-xl border border-stone-200 bg-white px-4 text-sm outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-200 dark:border-stone-800 dark:bg-stone-950 dark:focus:ring-stone-800"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white dark:bg-stone-50 dark:text-stone-950"
                >
                  <Plus size={16} aria-hidden="true" />
                  Save
                </button>
              </form>
              <p className="mt-3 text-sm text-stone-500">{activity}</p>
            </section>

            {activeSection === "Today" ? (
              <>
                <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">Daily Brief</p>
                      <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                        {getGreeting()}, Matthew
                      </h2>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <StatusPill>{getDateLabel()}</StatusPill>
                        <StatusPill>Dallas, TX / 78 F / clear placeholder</StatusPill>
                        <StatusPill>{tasks.filter((task) => task.status !== "Done").length} open tasks</StatusPill>
                      </div>
                      <p className="mt-5 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">
                        Today has {events.slice(0, 3).length} events, {todayTasks.length} top tasks,
                        {documents.length} document records, and {trips.length} trips in the planning system.
                      </p>
                    </div>
                    <div className="grid gap-3">
                      <DatabaseCard title="Today's Calendar" eyebrow="Preview">
                        <ul className="space-y-2">
                          {events.slice(0, 3).map((event) => (
                            <li key={event.id}>{event.time} / {event.title}</li>
                          ))}
                        </ul>
                      </DatabaseCard>
                      <DatabaseCard title="Top Tasks" eyebrow="Today">
                        <ul className="space-y-2">
                          {todayTasks.map((task) => (
                            <li key={task.id}>{task.title}</li>
                          ))}
                        </ul>
                      </DatabaseCard>
                    </div>
                  </div>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <DatabaseCard title="Recent Notes" eyebrow="Knowledge">
                    {recentNotes.map((note) => note.title).join(" / ")}
                  </DatabaseCard>
                  <DatabaseCard title="Upcoming Trips" eyebrow="Travel">
                    {trips.map((trip) => trip.destination).join(" / ")}
                  </DatabaseCard>
                  <DatabaseCard title="Home Projects" eyebrow="Home">
                    {projects.filter((project) => project.area === "Home").map((project) => project.title).join(" / ")}
                  </DatabaseCard>
                  <DatabaseCard title="Recent Documents" eyebrow="Files">
                    {documents.slice(0, 3).map((document) => document.title).join(" / ")}
                  </DatabaseCard>
                  <DatabaseCard title="Universal Search" eyebrow="Working Demo">
                    Type into search to filter across notes, tasks, documents, trips, and bookmarks.
                  </DatabaseCard>
                  <DatabaseCard title="Command Palette" eyebrow="Cmd+K">
                    Placeholder for keyboard-driven actions, AI capture, upload flows, and navigation.
                  </DatabaseCard>
                </section>

                <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => {
                      const mode = action === "New Task" ? "task" : action === "Upload Document" ? "document" : action === "Add Trip" ? "trip" : action === "Add Home Project" ? "project" : action === "Add Bookmark" ? "bookmark" : "note";

                      return (
                        <button
                          key={action}
                          type="button"
                          onClick={() => openComposer(mode)}
                          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
                        >
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
                      <DatabaseCard title={section.title} eyebrow="Section">
                        {section.description}
                      </DatabaseCard>
                    </button>
                  ))}
                </section>
              </>
            ) : activeFeature ? (
              <section className="mt-6 space-y-5">
                <SectionHeader section={activeFeature} />
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <DatabaseCard title="Section Contents" eyebrow="Scaffold">
                    <ul className="space-y-2">
                      {activeFeature.items.map((item) => (
                        <li key={item} className="rounded-lg bg-stone-50 px-3 py-2 dark:bg-stone-950">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </DatabaseCard>
                  <DatabaseCard title="Future Data Source" eyebrow="D1 + R2">
                    Public pages never read from this private section. Cloudflare Access protects
                    /dashboard, D1 stores structured rows, and R2 stores files and media.
                  </DatabaseCard>
                </div>
                {renderSectionContent(activeFeature)}
              </section>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
