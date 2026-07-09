import { NextResponse } from "next/server";
import { getUnifiedDashboardItems } from "@/lib/matthewos-ops";

export async function GET() {
  const items = await getUnifiedDashboardItems();
  return NextResponse.json({ items });
}
