import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { createWestWallScene, getWestWallDashboardData, queueWestWallCommand } from "@/lib/westwall-db";

export async function GET() {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ scenes: (await getWestWallDashboardData()).scenes });
}

export async function POST(request: Request) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const scene = await createWestWallScene(await request.json().catch(() => ({})));
  await queueWestWallCommand("refresh");
  return NextResponse.json({ scene }, { status: 201 });
}
