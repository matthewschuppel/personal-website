import { NextResponse } from "next/server";
import { updateWorkoutSession } from "@/lib/health-db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => ({}));
  const { id } = await context.params;
  const session = await updateWorkoutSession(id, body);
  return NextResponse.json({ session });
}
