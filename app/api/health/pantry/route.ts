import { NextResponse } from "next/server";
import { createPantryItem } from "@/lib/health-db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const item = await createPantryItem(body);
  return NextResponse.json({ item }, { status: 201 });
}
