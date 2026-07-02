import { NextResponse } from "next/server";
import { mockNotes } from "@/data/matthewos";

export async function GET() {
  // Future D1 integration: replace mockNotes with SELECT rows from the DB binding.
  return NextResponse.json({ notes: mockNotes });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  // Future D1 integration: validate body, insert into notes, and return the created row.
  return NextResponse.json(
    {
      note: {
        id: "note-preview",
        title: body.title ?? "Untitled note",
        summary: body.summary ?? "",
        tags: body.tags ?? [],
        updatedAt: "Just now"
      }
    },
    { status: 201 }
  );
}
