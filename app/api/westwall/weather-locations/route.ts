import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { createWestWallWeatherLocation, getWestWallDashboardData } from "@/lib/westwall-db";

export async function GET() {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getWestWallDashboardData();
  return NextResponse.json({ weatherLocations: data.weatherLocations });
}

export async function POST(request: Request) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const weatherLocation = await createWestWallWeatherLocation(body);
  return NextResponse.json({ weatherLocation }, { status: 201 });
}
