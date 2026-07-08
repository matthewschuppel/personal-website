import { NextResponse } from "next/server";
import { getWestWallDashboardData, updateWestWallAppearance } from "@/lib/westwall-db";

export async function GET() {
  const data = await getWestWallDashboardData();
  return NextResponse.json({ appearance: data.appearance });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({}));
  const appearance = await updateWestWallAppearance(body);
  return NextResponse.json({ appearance });
}
