import { NextResponse } from "next/server";
import { createWestWallFlight, getWestWallDashboardData } from "@/lib/westwall-db";

export async function GET() {
  const data = await getWestWallDashboardData();
  return NextResponse.json({ flights: data.flights });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const flight = await createWestWallFlight(body);
  return NextResponse.json({ flight }, { status: 201 });
}
