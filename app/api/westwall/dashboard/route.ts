import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { getWestWallDashboardData } from "@/lib/westwall-db";
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
  return NextResponse.json({ westwall, calendarSync, calendarError });
}
