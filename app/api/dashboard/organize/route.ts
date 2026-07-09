import { NextResponse } from "next/server";
import { organizeInput } from "@/lib/matthewos-ops";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const value = String(body.value ?? "").trim();

  if (!value) {
    return NextResponse.json({ error: "value is required" }, { status: 400 });
  }

  const organized = await organizeInput(value);
  return NextResponse.json(organized, { status: 201 });
}
