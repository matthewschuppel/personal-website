import { NextResponse } from "next/server";
import { canManageGallery } from "@/lib/gallery-auth";
import { getAppleCalendarEvents } from "@/lib/apple-calendar";

export async function GET() {
  if (!(await canManageGallery())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const calendar = await getAppleCalendarEvents();
    return NextResponse.json(calendar);
  } catch {
    return NextResponse.json(
      { configured: true, events: [], error: "Calendar unavailable" },
      { status: 502 }
    );
  }
}
