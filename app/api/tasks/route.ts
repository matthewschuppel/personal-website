import { NextResponse } from "next/server";
import { createTask, listTasks } from "@/lib/dashboard-db";

export async function GET() {
  const tasks = await listTasks();
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const task = await createTask(body);
  return NextResponse.json({ task }, { status: 201 });
}
