import { NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/dashboard-db";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const project = await createProject(body);
  return NextResponse.json({ project }, { status: 201 });
}
