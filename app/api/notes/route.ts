import { NextResponse } from "next/server";
import { createNote, listNotes } from "@/lib/dashboard-db";

export async function GET() {
  const notes = await listNotes();
  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const note = await createNote(body);
  return NextResponse.json({ note }, { status: 201 });
}
