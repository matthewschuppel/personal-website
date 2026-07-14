import { NextResponse } from "next/server";
import { toggleGroceryItem } from "@/lib/health-db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => ({}));
  const { id } = await context.params;
  await toggleGroceryItem(id, Boolean(body.checked));
  return NextResponse.json({ ok: true });
}
