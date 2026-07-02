import { NextResponse } from "next/server";
import { uploadDocument } from "@/lib/dashboard-db";

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const category = String(formData?.get("category") ?? "Documents");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const document = await uploadDocument(file, category);
  return NextResponse.json({ document }, { status: 201 });
}
