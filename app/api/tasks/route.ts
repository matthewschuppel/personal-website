import { NextResponse } from "next/server";
import { mockTasks } from "@/data/matthewos";

export async function GET() {
  // Future D1 integration: replace mockTasks with SELECT rows from the DB binding.
  return NextResponse.json({ tasks: mockTasks });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  // Future D1 integration: validate body, insert into tasks, and return the created row.
  return NextResponse.json(
    {
      task: {
        id: "task-preview",
        title: body.title ?? "Untitled task",
        priority: body.priority ?? "Medium",
        status: body.status ?? "Today",
        dueDate: body.dueDate ?? "Unscheduled",
        area: body.area ?? "Today"
      }
    },
    { status: 201 }
  );
}
