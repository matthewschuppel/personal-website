import { NextResponse } from "next/server";
import { createWestWallTicker, getWestWallDashboardData } from "@/lib/westwall-db";

export async function GET() {
  const data = await getWestWallDashboardData();
  return NextResponse.json({ stocks: data.stocks });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const stock = await createWestWallTicker(body);
  return NextResponse.json({ stock }, { status: 201 });
}
