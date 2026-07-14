import { NextResponse } from "next/server";
import { createGroceryItem } from "@/lib/health-db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const item = await createGroceryItem(body);
  return NextResponse.json({ item }, { status: 201 });
}
