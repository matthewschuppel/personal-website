import { NextResponse } from "next/server";
import { createWorkoutSession } from "@/lib/health-db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const session = await createWorkoutSession(body);
  return NextResponse.json({ session }, { status: 201 });
}
