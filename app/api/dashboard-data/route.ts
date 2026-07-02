import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import {
  readDashboardState,
  writeDashboardState,
  type StoredDashboardState
} from "@/lib/dashboard-r2";

export async function GET() {
  if (!(await canUsePrivateDashboard())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dashboard = await readDashboardState();
  return NextResponse.json(dashboard);
}

export async function PUT(request: Request) {
  if (!(await canUsePrivateDashboard())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { state?: unknown };
  const state = await writeDashboardState(
    typeof body.state === "object" && body.state !== null
      ? (body.state as Partial<StoredDashboardState>)
      : {}
  );

  return NextResponse.json({ state });
}
