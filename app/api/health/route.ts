import { NextResponse } from "next/server";
import { getHealthData } from "@/lib/health-db";

export async function GET() {
  const health = await getHealthData();
  return NextResponse.json({ health });
}
