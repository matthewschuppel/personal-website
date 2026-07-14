import { NextResponse } from "next/server";
import { createMealPlanEntry } from "@/lib/health-db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const meal = await createMealPlanEntry(body);
  return NextResponse.json({ meal }, { status: 201 });
}
