import { NextResponse } from "next/server";
import { deleteTask, updateTask } from "@/lib/dashboard-db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => ({}));
  const { id } = await context.params;
  const task = await updateTask(id, body);

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await deleteTask(id);
  return NextResponse.json({ deleted: true, id });
}
