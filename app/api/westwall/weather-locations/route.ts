import { NextResponse } from "next/server";
import { createWestWallWeatherLocation, getWestWallDashboardData } from "@/lib/westwall-db";

export async function GET() {
  const data = await getWestWallDashboardData();
  return NextResponse.json({ weatherLocations: data.weatherLocations });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const weatherLocation = await createWestWallWeatherLocation(body);
  return NextResponse.json({ weatherLocation }, { status: 201 });
}
