import { NextResponse } from "next/server";
import { deleteResource, updateResource } from "@/lib/dashboard-db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => ({}));
  const { id } = await context.params;
  const resource = await updateResource(id, body);
  return NextResponse.json({ resource });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await deleteResource(id);
  return NextResponse.json({ deleted: true, id });
}
