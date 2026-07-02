import {
  dashboardSections,
  planningQueue,
  todayMetrics,
  type DashboardMetric,
  type DashboardPlan,
  type DashboardSection
} from "@/data/dashboard";
import { getR2Bucket } from "@/lib/r2-storage";

export type StoredDashboardSection = Omit<DashboardSection, "icon">;
export type StoredDashboardPlan = Omit<DashboardPlan, "icon">;

export type StoredDashboardState = {
  metrics: DashboardMetric[];
  plans: StoredDashboardPlan[];
  sections: StoredDashboardSection[];
};

const DASHBOARD_STATE_KEY = "dashboard/state.json";

export function getDefaultDashboardState(): StoredDashboardState {
  return {
    metrics: todayMetrics,
    plans: planningQueue.map((plan) => ({
      label: plan.label,
      text: plan.text
    })),
    sections: dashboardSections.map((section) => ({
      title: section.title,
      items: section.items
    }))
  };
}

function normalizeDashboardState(state: Partial<StoredDashboardState>): StoredDashboardState {
  const defaultState = getDefaultDashboardState();

  return {
    metrics: Array.isArray(state.metrics) ? state.metrics : defaultState.metrics,
    plans: Array.isArray(state.plans) ? state.plans : defaultState.plans,
    sections: Array.isArray(state.sections) ? state.sections : defaultState.sections
  };
}

export async function readDashboardState() {
  const bucket = getR2Bucket("DASHBOARD_BUCKET", "GALLERY_BUCKET");
  const stateObject = await bucket.get(DASHBOARD_STATE_KEY);

  if (!stateObject) {
    return {
      state: getDefaultDashboardState(),
      source: "default" as const
    };
  }

  try {
    const rawState = new TextDecoder().decode(await stateObject.arrayBuffer());
    return {
      state: normalizeDashboardState(JSON.parse(rawState) as Partial<StoredDashboardState>),
      source: "r2" as const
    };
  } catch {
    return {
      state: getDefaultDashboardState(),
      source: "default" as const
    };
  }
}

export async function writeDashboardState(state: Partial<StoredDashboardState>) {
  const bucket = getR2Bucket("DASHBOARD_BUCKET", "GALLERY_BUCKET");
  const normalizedState = normalizeDashboardState(state);

  await bucket.put(DASHBOARD_STATE_KEY, JSON.stringify(normalizedState, null, 2), {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });

  return normalizedState;
}
