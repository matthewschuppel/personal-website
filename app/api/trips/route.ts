import { NextResponse } from "next/server";
import { createTrip, listTrips } from "@/lib/dashboard-db";

export async function GET() {
  const trips = await listTrips();
  return NextResponse.json({ trips });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const trip = await createTrip(body);
  return NextResponse.json({ trip }, { status: 201 });
}
