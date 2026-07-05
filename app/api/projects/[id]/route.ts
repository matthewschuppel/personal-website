import { NextResponse } from "next/server";
import { deleteProject } from "@/lib/dashboard-db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await deleteProject(id);
  return NextResponse.json({ deleted: true, id });
}
