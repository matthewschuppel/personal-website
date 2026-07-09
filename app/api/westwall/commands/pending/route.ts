import { NextResponse } from "next/server";
import { isWestWallDeviceAuthorized, listPendingWestWallCommands } from "@/lib/westwall-db";

export async function GET(request: Request) {
  if (!isWestWallDeviceAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const commands = await listPendingWestWallCommands();
  return NextResponse.json({ commands });
}
