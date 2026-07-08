import { NextResponse } from "next/server";
import { isWestWallDeviceAuthorized, queueWestWallCommand } from "@/lib/westwall-db";

export async function POST(request: Request) {
  if (!isWestWallDeviceAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const command = String(body.command ?? "refresh");
  const log = await queueWestWallCommand(command, body.payload ?? {});

  return NextResponse.json({ queued: true, command: log });
}
