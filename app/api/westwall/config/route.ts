import { NextResponse } from "next/server";
import { buildWestWallDeviceConfig, isWestWallDeviceAuthorized } from "@/lib/westwall-db";

export async function GET(request: Request) {
  if (!isWestWallDeviceAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await buildWestWallDeviceConfig();
  return NextResponse.json(config);
}
