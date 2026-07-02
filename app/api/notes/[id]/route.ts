import { NextResponse } from "next/server";
import { deleteNote, updateNote } from "@/lib/dashboard-db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => ({}));
  const { id } = await context.params;
  const note = await updateNote(id, body);

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ note });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await deleteNote(id);
  return NextResponse.json({ deleted: true, id });
}
