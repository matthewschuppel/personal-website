import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { deleteWestWallMessage, updateWestWallMessage } from "@/lib/westwall-db";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const message = await updateWestWallMessage(id, body);
  return message ? NextResponse.json({ message }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  await deleteWestWallMessage(id);
  return NextResponse.json({ ok: true });
}
