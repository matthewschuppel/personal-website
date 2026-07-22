import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { deleteWestWallTicker } from "@/lib/westwall-db";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  await deleteWestWallTicker(id);
  return NextResponse.json({ ok: true });
}
