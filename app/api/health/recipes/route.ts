import { NextResponse } from "next/server";
import { createRecipe } from "@/lib/health-db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const recipe = await createRecipe(body);
  return NextResponse.json({ recipe }, { status: 201 });
}
