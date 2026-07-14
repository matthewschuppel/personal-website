import { NextResponse } from "next/server";
import { createProgressEntry } from "@/lib/health-db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const entry = await createProgressEntry(body);
  return NextResponse.json({ entry }, { status: 201 });
}
