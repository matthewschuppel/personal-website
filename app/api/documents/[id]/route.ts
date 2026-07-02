import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  // Future R2 integration: delete the object from DOCUMENTS_BUCKET and metadata from D1 documents.
  return NextResponse.json({ deleted: true, id });
}
