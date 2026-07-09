import { NextResponse } from "next/server";
import { createCalendarDraft } from "@/lib/matthewos-ops";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const draft = await createCalendarDraft(body);
  return NextResponse.json({ draft, note: "Calendar write-back is staged as a draft until a write-capable calendar provider is connected." }, { status: 201 });
}
