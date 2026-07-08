import { NextResponse } from "next/server";
import { isWestWallDeviceAuthorized, recordWestWallCheckin } from "@/lib/westwall-db";

export async function POST(request: Request) {
  if (!isWestWallDeviceAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const checkin = await recordWestWallCheckin({
    firmwareVersion: body.firmwareVersion ?? body.firmware_version,
    wifiRssi: body.wifiRssi ?? body.wifi_rssi,
    uptimeSeconds: body.uptimeSeconds ?? body.uptime_seconds,
    freeMemoryBytes: body.freeMemoryBytes ?? body.free_memory_bytes,
    currentScreen: body.currentScreen ?? body.current_screen
  });

  return NextResponse.json({ ok: true, checkin });
}
