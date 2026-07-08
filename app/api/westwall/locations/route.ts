import { NextResponse } from "next/server";
import { createWestWallLocation, getWestWallDashboardData } from "@/lib/westwall-db";

export async function GET() {
  const data = await getWestWallDashboardData();
  return NextResponse.json({ locations: data.locations });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const location = await createWestWallLocation(body);
  return NextResponse.json({ location }, { status: 201 });
}
