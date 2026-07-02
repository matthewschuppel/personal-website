import { NextResponse } from "next/server";
import { canManageGallery } from "@/lib/gallery-auth";
import { addGalleryPhoto, listPublicGalleryPhotos } from "@/lib/gallery-r2";

export async function GET() {
  const photos = await listPublicGalleryPhotos();
  return NextResponse.json({ photos });
}

export async function POST(request: Request) {
  if (!(await canManageGallery())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  const photo = await addGalleryPhoto({
    file,
    title: String(formData.get("title") ?? ""),
    location: String(formData.get("location") ?? ""),
    date: String(formData.get("date") ?? "")
  });

  return NextResponse.json({ photo }, { status: 201 });
}
