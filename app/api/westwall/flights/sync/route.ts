import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { syncWestWallFlightsFromCalendar } from "@/lib/westwall-calendar";

export async function POST() {
  if (!(await canUsePrivateDashboard())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sync = await syncWestWallFlightsFromCalendar({ refresh: true });
    return NextResponse.json({ sync });
  } catch {
    return NextResponse.json({ error: "Calendar sync failed" }, { status: 502 });
  }
}
