import { NextResponse } from "next/server";
import { createHabit, listHabits } from "@/lib/dashboard-db";

export async function GET() {
  const habits = await listHabits();
  return NextResponse.json({ habits });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const habit = await createHabit(body);
  return NextResponse.json({ habit }, { status: 201 });
}
