"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Command,
  FilePlus2,
  Plus,
  Search,
  UploadCloud
} from "lucide-react";
import {
  featureSections,
  mockDocuments,
  mockNotes,
  mockProjects,
  mockTasks,
  mockTrips,
  osNavigation,
  quickActions
} from "@/data/matthewos";
import type { StoredDashboardState } from "@/lib/dashboard-r2";

type DashboardDataResponse = {
  state: StoredDashboardState;
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

function DatabaseCard({
  title,
  meta,
  children
}: {
  title: string;
  meta?: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-stone-950">{title}</h3>
          {meta ? <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-stone-400">{meta}</p> : null}
        </div>
      </div>
      {children ? <div className="mt-3 text-sm leading-6 text-stone-600">{children}</div> : null}
    </article>
  );
}

export function MatthewOSDashboard() {
  const [activeSection, setActiveSection] = useState("Today");
  const [query, setQuery] = useState("");
  const [capture, setCapture] = useState("");
  const [userState, setUserState] = useState<StoredDashboardState>({
    metrics: [],
    plans: [],
    sections: defaultUserSections
  });

  useEffect(() => {
    // Future database/auth integration: replace this endpoint with an authenticated data layer.
    fetch("/api/dashboard-data")
      .then((response) => response.json() as Promise<DashboardDataResponse>)
      .then((data) => setUserState(data.state))
      .catch(() => {
        // Future database/auth integration can surface a richer offline state here.
      });
  }, []);

  const todayTasks = useMemo(() => {
    const taskSection = userState.sections.find((section) => section.title.toLowerCase() === "tasks");
    return (taskSection?.items ?? mockTasks.map((task) => task.title)).slice(0, 3);
  }, [userState.sections]);

  const recentNotes = useMemo(() => {
    const notesSection = userState.sections.find((section) => section.title.toLowerCase() === "notes");
    return (notesSection?.items ?? mockNotes.map((note) => note.title)).slice(0, 3);
  }, [userState.sections]);

  const todayEvents = useMemo(() => {
    const calendarSection = userState.sections.find((section) => section.title.toLowerCase() === "calendar");
    return (calendarSection?.items ?? ["9:00 AM Focus block", "2:00 PM Follow-up window"]).slice(0, 3);
  }, [userState.sections]);

  const filteredSections = featureSections.filter((section) =>
    `${section.title} ${section.items.join(" ")}`.toLowerCase().includes(query.toLowerCase())
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

    // Future AI integration: classify capture text, extract dates, and enrich metadata before saving.
    await fetch("/api/dashboard-data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: nextState })
    });
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-stone-200 bg-white/85 p-4 backdrop-blur lg:border-b-0 lg:border-r">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Private</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">MatthewOS</h1>
            <p className="mt-2 text-sm leading-6 text-stone-500">A private personal operating system scaffold.</p>
          </div>
          <nav className="mt-4 grid gap-1">
            {osNavigation.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveSection(item.label)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                  activeSection === item.label
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
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
              <label className="relative block w-full md:max-w-xl">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  aria-hidden="true"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search MatthewOS..."
                  className="w-full rounded-lg border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200"
                />
              </label>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-600 shadow-sm">
                <Command size={16} aria-hidden="true" />
                Cmd+K
              </button>
            </div>

            <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">
                    Dashboard Home
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight">{getGreeting()}, Matthew</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-md bg-stone-100 px-3 py-2 text-sm font-medium text-stone-600">
                      Date placeholder
                    </span>
                    <span className="rounded-md bg-stone-100 px-3 py-2 text-sm font-medium text-stone-600">
                      Weather placeholder
                    </span>
                  </div>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={capture}
                      onChange={(event) => setCapture(event.target.value)}
                      placeholder="Capture a note, task, bookmark, or idea..."
                      className="min-h-11 flex-1 rounded-lg border border-stone-200 px-4 text-sm outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-200"
                    />
                    <button
                      type="button"
                      onClick={() => captureItem("Notes")}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 py-3 text-sm font-semibold text-white"
                    >
                      <Plus size={16} aria-hidden="true" />
                      Capture
                    </button>
                  </div>
                </div>
                <div className="grid gap-3">
                  <DatabaseCard title="Today’s Calendar" meta="Preview">
                    {todayEvents.join(" / ")}
                  </DatabaseCard>
                  <DatabaseCard title="Top 3 Tasks" meta="Today">
                    {todayTasks.join(" / ")}
                  </DatabaseCard>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <DatabaseCard title="Recent Notes" meta="Knowledge">
                {recentNotes.join(" / ")}
              </DatabaseCard>
              <DatabaseCard title="Upcoming Trips" meta="Travel">
                {mockTrips.map((trip) => trip.destination).join(" / ")}
              </DatabaseCard>
              <DatabaseCard title="Home Projects" meta="Home">
                {mockProjects.map((project) => project.title).join(" / ")}
              </DatabaseCard>
              <DatabaseCard title="Recent Documents" meta="Files">
                {mockDocuments.map((document) => document.title).join(" / ")}
              </DatabaseCard>
              <DatabaseCard title="Universal Search" meta="Scaffold">
                Search is currently mocked client-side. Future database and AI integrations can index R2,
                D1, external notes, and uploaded documents.
              </DatabaseCard>
              <DatabaseCard title="Command Palette" meta="Cmd+K">
                Placeholder for actions, navigation, AI capture, upload flows, and keyboard shortcuts.
              </DatabaseCard>
            </section>

            <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => setCapture(action)}
                    className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-white"
                  >
                    {/* Future file upload integration: route upload actions to R2-backed document storage. */}
                    {action.includes("Upload") ? <UploadCloud size={16} /> : <FilePlus2 size={16} />}
                    {action}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredSections.map((section) => (
                <DatabaseCard key={section.title} title={section.title} meta="Database">
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="rounded-md bg-stone-50 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </DatabaseCard>
              ))}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
