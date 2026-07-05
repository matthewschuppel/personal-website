import { NextResponse } from "next/server";
import { deleteDocument, getDocumentObject } from "@/lib/dashboard-db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await deleteDocument(id);
  return NextResponse.json({ deleted: true, id });
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const documentObject = await getDocumentObject(id);

  if (!documentObject) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return new Response(await documentObject.object.arrayBuffer(), {
    headers: {
      "Content-Type": documentObject.contentType,
      "Content-Disposition": `attachment; filename="${documentObject.title.replace(/"/g, "")}"`
    }
  });
}
