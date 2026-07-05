import { NextResponse } from "next/server";
import { createResource, listResources, type ResourceKey } from "@/lib/dashboard-db";

export async function GET() {
  const resources = await listResources();
  return NextResponse.json({ resources });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const section = String(body.section ?? "Knowledge Library") as ResourceKey;
  const resource = await createResource(section, body);
  return NextResponse.json({ resource }, { status: 201 });
}
