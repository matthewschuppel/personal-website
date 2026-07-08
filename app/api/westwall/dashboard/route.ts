import { NextResponse } from "next/server";
import { getWestWallDashboardData } from "@/lib/westwall-db";

export async function GET() {
  const westwall = await getWestWallDashboardData();
  return NextResponse.json({ westwall });
}
