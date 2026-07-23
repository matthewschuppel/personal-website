import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { createWestWallAlertRule, getWestWallDashboardData, queueWestWallCommand } from "@/lib/westwall-db";

export async function GET() {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ alertRules: (await getWestWallDashboardData()).alertRules });
}

export async function POST(request: Request) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rule = await createWestWallAlertRule(await request.json().catch(() => ({})));
  await queueWestWallCommand("refresh");
  return NextResponse.json({ rule }, { status: 201 });
}
