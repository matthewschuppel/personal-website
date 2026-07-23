import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { deleteWestWallAlertRule, queueWestWallCommand, updateWestWallAlertRule } from "@/lib/westwall-db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const rule = await updateWestWallAlertRule(id, await request.json().catch(() => ({})));
  if (!rule) return NextResponse.json({ error: "Alert rule not found" }, { status: 404 });
  await queueWestWallCommand("refresh");
  return NextResponse.json({ rule });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await deleteWestWallAlertRule(id);
  await queueWestWallCommand("refresh");
  return NextResponse.json({ ok: true });
}
