import { NextResponse } from "next/server";
import { getHealthData, suggestMeals } from "@/lib/health-db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const health = await getHealthData();
  const suggestions = suggestMeals(health, String(body.request ?? ""));
  return NextResponse.json({
    suggestions,
    source: "Rule-based local suggestions",
    note: "AI provider abstraction can replace this once a secure server-side AI key is configured."
  });
}
