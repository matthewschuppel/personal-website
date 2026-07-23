import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { buildWestWallCurrentPayload, getWestWallDashboardData } from "@/lib/westwall-db";
import { syncWestWallFlightsFromCalendar } from "@/lib/westwall-calendar";

export async function GET() {
  if (!(await canUsePrivateDashboard())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let calendarSync: Awaited<ReturnType<typeof syncWestWallFlightsFromCalendar>> | null = null;
  let calendarError = "";
  try {
    calendarSync = await syncWestWallFlightsFromCalendar();
  } catch {
    calendarError = "Calendar sync is temporarily unavailable.";
  }
  const westwall = await getWestWallDashboardData();
  try {
    const current = await buildWestWallCurrentPayload();
    westwall.feedHealth = current.feedHealth;
  } catch {
    // The manager still loads when an external display feed is temporarily down.
  }
  return NextResponse.json({ westwall, calendarSync, calendarError });
}
