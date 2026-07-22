import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { createWestWallFlight, getWestWallDashboardData } from "@/lib/westwall-db";

export async function GET() {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getWestWallDashboardData();
  return NextResponse.json({ flights: data.flights });
}

export async function POST(request: Request) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const flight = await createWestWallFlight(body);
  return NextResponse.json({ flight }, { status: 201 });
}
