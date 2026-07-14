import { NextResponse } from "next/server";
import { upsertReminder } from "@/lib/health-db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const reminder = await upsertReminder(body);
  return NextResponse.json({ reminder });
}
