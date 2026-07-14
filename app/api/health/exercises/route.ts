import { NextResponse } from "next/server";
import { createExercise } from "@/lib/health-db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const exercise = await createExercise(body);
  return NextResponse.json({ exercise }, { status: 201 });
}
