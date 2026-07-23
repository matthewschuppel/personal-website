import { NextResponse } from "next/server";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";
import { deleteWestWallScene, queueWestWallCommand, updateWestWallScene } from "@/lib/westwall-db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const scene = await updateWestWallScene(id, await request.json().catch(() => ({})));
  if (!scene) return NextResponse.json({ error: "Scene not found" }, { status: 404 });
  await queueWestWallCommand("refresh");
  return NextResponse.json({ scene });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await canUsePrivateDashboard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await deleteWestWallScene(id);
  await queueWestWallCommand("refresh");
  return NextResponse.json({ ok: true });
}
