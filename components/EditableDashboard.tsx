"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
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

  useEffect(() => {
    setState(readStoredState());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSaveStatus("Saved");
  }, [isLoaded, state]);

  const exportData = useMemo(() => JSON.stringify(state, null, 2), [state]);

  function updateMetric(index: number, key: keyof DashboardMetric, value: string) {
    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      metrics: current.metrics.map((metric, metricIndex) =>
        metricIndex === index ? { ...metric, [key]: value } : metric
      )
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

  function updateSectionTitle(index: number, value: string) {
    setSaveStatus("Saving...");
    setState((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, title: value } : section
      )
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

  return (
    <>
      <section className="mt-6 rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Edit mode</p>
            <p className="mt-1 text-sm text-ink/60">
              Changes save automatically in this browser. Export a backup before switching devices.
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

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {state.metrics.map((metric, index) => (
          <article
            key={`${metric.label}-${index}`}
            className={`rounded-lg border border-ink/10 p-5 shadow-sm ${
              index === 0 ? "bg-clay text-white" : "bg-white text-ink"
            }`}
          >
            <Field
              label="Label"
              value={metric.label}
              onChange={(value) => updateMetric(index, "label", value)}
            />
            <div className="mt-3">
              <Field
                label="Value"
                value={metric.value}
                onChange={(value) => updateMetric(index, "value", value)}
              />
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
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
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      </section>
    </>
  );
}
