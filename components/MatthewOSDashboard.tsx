"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Command,
  Database,
  FilePlus2,
  FolderOpen,
  Plus,
  Search,
  UploadCloud
} from "lucide-react";
import {
  featureSections,
  mockBookmarks,
  mockDocuments,
  mockNotes,
  mockProjects,
  mockTasks,
  mockTrips,
  osNavigation,
  quickActions,
  type DashboardSectionKey,
  type FeatureSection
} from "@/data/matthewos";
import type { StoredDashboardState } from "@/lib/dashboard-r2";

type DashboardDataResponse = {
  state: StoredDashboardState;
};

type DatabaseCardProps = {
  title: string;
  eyebrow?: string;
  meta?: string;
  children?: ReactNode;
};

const defaultUserSections = [
  { title: "Today", items: ["Morning review", "Calendar scan", "Top three priorities"] },
  { title: "Tasks", items: mockTasks.map((task) => task.title) },
  { title: "Notes", items: mockNotes.map((note) => note.title) },
  { title: "Calendar", items: ["9:00 AM Focus block", "2:00 PM Follow-up window"] }
];

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

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
      {label} is ready for real data once D1, R2, and Cloudflare Access are connected.
    </div>
  );
}

function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
      {children}
    </span>
  );
}

function SectionPanel({ section }: { section: FeatureSection }) {
  const documents = mockDocuments.filter((document) => document.category === section.title);
  const projects = mockProjects.filter((project) => project.area === section.title);
  const bookmarks = mockBookmarks.filter((bookmark) => bookmark.category === section.title);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">MatthewOS Database</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
          {section.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">
          {section.description}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <DatabaseCard title="Section Contents" eyebrow="Scaffold">
          <ul className="space-y-2">
            {section.items.map((item) => (
              <li key={item} className="rounded-lg bg-stone-50 px-3 py-2 dark:bg-stone-950">
                {item}
              </li>
            ))}
          </ul>
        </DatabaseCard>
        <DatabaseCard title="Future Data Source" eyebrow="D1 + R2">
          {/* Future database integration: load structured rows from D1 and attach file/media keys from R2. */}
          Public pages never read from this private section. Cloudflare Access should protect
          /dashboard before real personal data is added.
        </DatabaseCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {section.title === "Notes"
          ? mockNotes.map((note) => (
              <DatabaseCard key={note.id} title={note.title} eyebrow="Note" meta={note.updatedAt}>
                <p>{note.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <StatusPill key={tag}>{tag}</StatusPill>
                  ))}
                </div>
              </DatabaseCard>
            ))
          : null}

        {section.title === "Tasks"
          ? mockTasks.map((task) => (
              <DatabaseCard key={task.id} title={task.title} eyebrow={task.area} meta={task.status}>
                <div className="flex flex-wrap gap-2">
                  <StatusPill>{task.priority}</StatusPill>
                  <StatusPill>{task.dueDate}</StatusPill>
                </div>
              </DatabaseCard>
            ))
          : null}

        {section.title === "Calendar" ? (
          <DatabaseCard title="Upcoming Events" eyebrow="Calendar">
            {/* Future calendar integration: connect Apple Calendar, Google Calendar, or a D1 events table here. */}
            <ul className="space-y-2">
              <li>9:00 AM Focus block</li>
              <li>2:00 PM Follow-up window</li>
              <li>Friday planning review</li>
            </ul>
          </DatabaseCard>
        ) : null}

        {section.title === "Documents"
          ? mockDocuments.map((document) => (
              <DatabaseCard key={document.id} title={document.title} eyebrow={document.category} meta={document.type}>
                {document.updatedAt}
              </DatabaseCard>
            ))
          : null}

        {section.title === "Travel"
          ? mockTrips.map((trip) => (
              <DatabaseCard key={trip.id} title={trip.destination} eyebrow={trip.status} meta={trip.dates}>
                {trip.detail}
              </DatabaseCard>
            ))
          : null}

        {projects.map((project) => (
          <DatabaseCard key={project.id} title={project.title} eyebrow={project.area} meta={project.status}>
            {project.nextStep}
          </DatabaseCard>
        ))}

        {bookmarks.map((bookmark) => (
          <DatabaseCard key={bookmark.id} title={bookmark.title} eyebrow="Bookmark">
            <a href={bookmark.url} className="inline-flex items-center gap-2 font-semibold text-stone-950 dark:text-stone-50">
              Open link
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </DatabaseCard>
        ))}

        {section.title === "Settings" ? (
          <>
            <DatabaseCard title="Profile" eyebrow="Placeholder">
              Name, timezone, location, and dashboard preferences will live here later.
            </DatabaseCard>
            <DatabaseCard title="Integrations" eyebrow="Placeholder">
              Future controls for calendar, AI search, D1 databases, R2 buckets, and notification services.
            </DatabaseCard>
          </>
        ) : null}
      </div>

      {!documents.length && !projects.length && !bookmarks.length && !["Notes", "Tasks", "Calendar", "Documents", "Travel", "Settings"].includes(section.title) ? (
        <EmptyState label={section.title} />
      ) : null}
    </section>
  );
}

export function MatthewOSDashboard() {
  const [activeSection, setActiveSection] = useState<DashboardSectionKey>("Today");
  const [query, setQuery] = useState("");
  const [capture, setCapture] = useState("");
  const [userState, setUserState] = useState<StoredDashboardState>({
    metrics: [],
    plans: [],
    sections: defaultUserSections
  });

  useEffect(() => {
    // Future auth/database integration: this endpoint should run behind Cloudflare Access and can move to D1.
    fetch("/api/dashboard-data")
      .then((response) => response.json() as Promise<DashboardDataResponse>)
      .then((data) => setUserState(data.state))
      .catch(() => {
        // Keep the local mock fallback if Cloudflare runtime bindings are unavailable in development.
      });
  }, []);

  const todayTasks = useMemo(() => mockTasks.filter((task) => task.status === "Today").slice(0, 3), []);
  const recentNotes = useMemo(() => mockNotes.slice(0, 3), []);
  const todayEvents = useMemo(() => {
    const calendarSection = userState.sections.find((section) => section.title.toLowerCase() === "calendar");
    return (calendarSection?.items ?? ["9:00 AM Focus block", "2:00 PM Follow-up window"]).slice(0, 3);
  }, [userState.sections]);
  const activeFeature = featureSections.find((section) => section.title === activeSection);
  const filteredSections = featureSections.filter((section) =>
    `${section.title} ${section.description} ${section.items.join(" ")}`.toLowerCase().includes(query.toLowerCase())
  );

  async function captureItem(targetSection = "Notes") {
    const item = capture.trim();

    if (!item) {
      return;
    }

    const nextState = {
      ...userState,
      sections: userState.sections.some((section) => section.title === targetSection)
        ? userState.sections.map((section) =>
            section.title === targetSection ? { ...section, items: [item, ...section.items] } : section
          )
        : [...userState.sections, { title: targetSection, items: [item] }]
    };

    setUserState(nextState);
    setCapture("");

    // Future AI integration: classify capture text, extract dates, assign labels, then save to D1/R2.
    await fetch("/api/dashboard-data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: nextState })
    }).catch(() => undefined);
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-stone-200 bg-white/85 p-4 backdrop-blur dark:border-stone-800 dark:bg-stone-950/80 lg:border-b-0 lg:border-r">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Private</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">MatthewOS</h1>
            <p className="mt-2 text-sm leading-6 text-stone-500 dark:text-stone-400">
              A private personal operating system prepared for Cloudflare Access, D1, and R2.
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
                  placeholder="Search MatthewOS..."
                  className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:focus:ring-stone-800"
                />
              </label>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-600 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                <Command size={16} aria-hidden="true" />
                Cmd+K
              </button>
            </div>

            {activeSection === "Today" ? (
              <>
                <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">
                        Daily Brief
                      </p>
                      <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                        {getGreeting()}, Matthew
                      </h2>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <StatusPill>{getDateLabel()}</StatusPill>
                        <StatusPill>Dallas, TX weather placeholder</StatusPill>
                      </div>
                      <p className="mt-5 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">
                        Today has {todayEvents.length} calendar previews, {todayTasks.length} high-focus tasks,
                        and {recentNotes.length} recent notes ready for review.
                      </p>
                      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <input
                          value={capture}
                          onChange={(event) => setCapture(event.target.value)}
                          placeholder="Capture a note, task, bookmark, or idea..."
                          className="min-h-11 flex-1 rounded-xl border border-stone-200 bg-white px-4 text-sm outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-200 dark:border-stone-800 dark:bg-stone-950 dark:focus:ring-stone-800"
                        />
                        <button
                          type="button"
                          onClick={() => captureItem("Notes")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white dark:bg-stone-50 dark:text-stone-950"
                        >
                          <Plus size={16} aria-hidden="true" />
                          Capture
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <DatabaseCard title="Today's Calendar" eyebrow="Preview">
                        <ul className="space-y-2">
                          {todayEvents.map((event) => (
                            <li key={event}>{event}</li>
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
                    {mockTrips.map((trip) => trip.destination).join(" / ")}
                  </DatabaseCard>
                  <DatabaseCard title="Home Projects" eyebrow="Home">
                    {mockProjects.filter((project) => project.area === "Home").map((project) => project.title).join(" / ")}
                  </DatabaseCard>
                  <DatabaseCard title="Recent Documents" eyebrow="Files">
                    {mockDocuments.slice(0, 3).map((document) => document.title).join(" / ")}
                  </DatabaseCard>
                  <DatabaseCard title="Universal Search" eyebrow="Scaffold">
                    {/* Future search integration: index D1 rows, R2 object metadata, calendar events, and AI summaries. */}
                    Search is currently mocked client-side and ready for a server-backed index later.
                  </DatabaseCard>
                  <DatabaseCard title="Command Palette" eyebrow="Cmd+K">
                    Placeholder for actions, navigation, AI capture, upload flows, and shortcuts.
                  </DatabaseCard>
                </section>

                <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => setCapture(action)}
                        className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
                      >
                        {action.includes("Upload") ? <UploadCloud size={16} /> : <FilePlus2 size={16} />}
                        {action}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredSections.map((section) => (
                    <DatabaseCard key={section.title} title={section.title} eyebrow="Section">
                      {section.description}
                    </DatabaseCard>
                  ))}
                </section>
              </>
            ) : activeFeature ? (
              <div className="mt-6">
                <SectionPanel section={activeFeature} />
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <DatabaseCard title="File Vault" eyebrow="Documents">
                  <FolderOpen size={20} className="mb-3 text-stone-400" aria-hidden="true" />
                  Document storage is prepared for R2-backed uploads, downloads, and deletes.
                </DatabaseCard>
                <DatabaseCard title="Database Ready" eyebrow="Cloudflare D1">
                  <Database size={20} className="mb-3 text-stone-400" aria-hidden="true" />
                  Structured dashboard data can move from local mock arrays into D1 tables.
                </DatabaseCard>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
