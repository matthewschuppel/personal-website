import { NextResponse } from "next/server";
import { createWestWallMessage, getWestWallDashboardData } from "@/lib/westwall-db";

export async function GET() {
  const data = await getWestWallDashboardData();
  return NextResponse.json({ messages: data.messages });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const message = await createWestWallMessage(body);
  return NextResponse.json({ message }, { status: 201 });
}
