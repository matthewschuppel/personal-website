import { NextResponse } from "next/server";
import { getWestWallDashboardData, updateWestWallRotation } from "@/lib/westwall-db";

export async function GET() {
  const data = await getWestWallDashboardData();
  return NextResponse.json({ rotation: data.rotation });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rotation = await updateWestWallRotation(Array.isArray(body.rotation) ? body.rotation : []);
  return NextResponse.json({ rotation });
}
