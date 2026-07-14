import { NextResponse } from "next/server";
import { generateGroceryListFromMealPlan } from "@/lib/health-db";

export async function POST() {
  const health = await generateGroceryListFromMealPlan();
  return NextResponse.json({ health });
}
