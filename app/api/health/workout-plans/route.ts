import { NextResponse } from "next/server";
import { createWorkoutPlan } from "@/lib/health-db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const plan = await createWorkoutPlan(body);
  return NextResponse.json({ plan }, { status: 201 });
}
