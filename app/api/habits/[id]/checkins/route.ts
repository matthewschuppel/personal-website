import { NextResponse } from "next/server";
import { toggleHabitCheckin } from "@/lib/dashboard-db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => ({}));
  const completedOn = typeof body.completedOn === "string" ? body.completedOn : "";

  if (!completedOn) {
    return NextResponse.json({ error: "completedOn is required." }, { status: 400 });
  }

  const { id } = await context.params;
  const checkin = await toggleHabitCheckin(id, completedOn);
  return NextResponse.json({ checkin });
}
