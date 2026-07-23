import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { getWestWallDashboardData, queueWestWallCommand, updateWestWallAppearance } from "@/lib/westwall-db";

export async function GET() {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getWestWallDashboardData();
  return NextResponse.json({ appearance: data.appearance });
}

export async function PUT(request: Request) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const current = await getWestWallDashboardData();
  const appearance = await updateWestWallAppearance(body);
  if (appearance.displayWidth !== current.appearance.displayWidth) {
    await queueWestWallCommand("set_display_width", { width: appearance.displayWidth });
  } else {
    await queueWestWallCommand("refresh");
  }
  return NextResponse.json({ appearance });
}
