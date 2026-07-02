import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  // Future R2 integration: put the file into DOCUMENTS_BUCKET and save metadata to D1 documents.
  return NextResponse.json(
    {
      document: {
        id: "document-preview",
        title: file.name,
        type: file.type || "application/octet-stream",
        size: file.size
      }
    },
    { status: 201 }
  );
}
