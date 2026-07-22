import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { createWestWallMessage, getWestWallDashboardData } from "@/lib/westwall-db";

export async function GET() {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getWestWallDashboardData();
  return NextResponse.json({ messages: data.messages });
}

export async function POST(request: Request) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const message = await createWestWallMessage(body);
  return NextResponse.json({ message }, { status: 201 });
}
