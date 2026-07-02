import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => ({}));
  const { id } = await context.params;

  // Future D1 integration: update the task by params.id and return the saved row.
  return NextResponse.json({ task: { id, ...body } });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  // Future D1 integration: delete the task by params.id.
  return NextResponse.json({ deleted: true, id });
}
