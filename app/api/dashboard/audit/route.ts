import { NextResponse } from "next/server";
import { getDashboardAudit } from "@/lib/matthewos-ops";

export async function GET() {
  const audit = await getDashboardAudit();
  return NextResponse.json({ audit });
}
