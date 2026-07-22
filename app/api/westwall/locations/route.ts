import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { createWestWallLocation, getWestWallDashboardData } from "@/lib/westwall-db";

export async function GET() {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getWestWallDashboardData();
  return NextResponse.json({ locations: data.locations });
}

export async function POST(request: Request) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const location = await createWestWallLocation(body);
  return NextResponse.json({ location }, { status: 201 });
}
