import { NextResponse } from "next/server";
import { getDashboardSettings, saveDashboardSettings } from "@/lib/dashboard-db";

export async function GET() {
  const settings = await getDashboardSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({}));
  const settings = await saveDashboardSettings(body);
  return NextResponse.json({ settings });
}
