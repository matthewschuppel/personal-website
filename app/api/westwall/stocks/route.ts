import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { createWestWallTicker, getWestWallDashboardData } from "@/lib/westwall-db";

export async function GET() {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getWestWallDashboardData();
  return NextResponse.json({ stocks: data.stocks });
}

export async function POST(request: Request) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const stock = await createWestWallTicker(body);
  return NextResponse.json({ stock }, { status: 201 });
}
