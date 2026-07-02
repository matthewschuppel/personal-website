import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { getAppleCalendarEvents } from "@/lib/apple-calendar";

export async function GET(request: Request) {
  if (!(await canUsePrivateDashboard())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "1";
    const calendar = await getAppleCalendarEvents({ refresh });
    return NextResponse.json({
      ...calendar,
      refreshedAt: new Date().toISOString()
    });
  } catch {
    return NextResponse.json(
      { configured: true, events: [], error: "Calendar unavailable", refreshedAt: new Date().toISOString() },
      { status: 502 }
    );
  }
}
