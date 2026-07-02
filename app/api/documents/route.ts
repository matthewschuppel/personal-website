import { NextResponse } from "next/server";
import { mockDocuments } from "@/data/matthewos";

export async function GET() {
  // Future R2 integration: list DOCUMENTS_BUCKET objects and join metadata from D1 documents.
  return NextResponse.json({ documents: mockDocuments });
}
