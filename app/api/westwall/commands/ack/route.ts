import { NextResponse } from "next/server";
import { acknowledgeWestWallCommand, isWestWallDeviceAuthorized } from "@/lib/westwall-db";

export async function POST(request: Request) {
  if (!isWestWallDeviceAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  await acknowledgeWestWallCommand(String(body.id ?? ""), body.status === "failed" ? "failed" : "acknowledged");
  return NextResponse.json({ ok: true });
}
