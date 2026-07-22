import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { isWestWallDeviceAuthorized, queueWestWallCommand } from "@/lib/westwall-db";

export async function POST(request: Request) {
  if (!isWestWallDeviceAuthorized(request) && !(await canUsePrivateDashboard())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const command = String(body.command ?? "refresh");
  const log = await queueWestWallCommand(command, body.payload ?? {});

  return NextResponse.json({ queued: true, command: log });
}
