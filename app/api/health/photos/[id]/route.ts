import { NextResponse } from "next/server";
import { getProgressPhoto } from "@/lib/health-db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const object = await getProgressPhoto(id);

  if (!object) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  return new Response(await object.arrayBuffer(), {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "private, max-age=300"
    }
  });
}
