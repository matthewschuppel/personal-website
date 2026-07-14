import { NextResponse } from "next/server";
import { upsertDailyLog } from "@/lib/health-db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const log = await upsertDailyLog(body);
  return NextResponse.json({ log });
}
