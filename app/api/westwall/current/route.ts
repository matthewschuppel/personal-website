import { NextResponse } from "next/server";
import { buildWestWallCurrentPayload, isWestWallDeviceAuthorized } from "@/lib/westwall-db";
import { syncWestWallFlightsIfDue } from "@/lib/westwall-calendar";

export async function GET(request: Request) {
  if (!isWestWallDeviceAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await syncWestWallFlightsIfDue(5);
  } catch {
    // Cached flights stay available when the calendar provider is temporarily down.
  }
  const payload = await buildWestWallCurrentPayload();
  return NextResponse.json(payload);
}
