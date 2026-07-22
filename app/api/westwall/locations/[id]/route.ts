import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { deleteWestWallLocation } from "@/lib/westwall-db";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  await deleteWestWallLocation(id);
  return NextResponse.json({ ok: true });
}
