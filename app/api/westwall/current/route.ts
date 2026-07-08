import { NextResponse } from "next/server";
import { buildWestWallCurrentPayload, isWestWallDeviceAuthorized } from "@/lib/westwall-db";

export async function GET(request: Request) {
  if (!isWestWallDeviceAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await buildWestWallCurrentPayload();
  return NextResponse.json(payload);
}
