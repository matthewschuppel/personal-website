import { NextResponse } from "next/server";
import { canManageGallery } from "@/lib/gallery-auth";
import { deleteGalleryPhoto, updateGalleryPhoto } from "@/lib/gallery-r2";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await canManageGallery())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    title?: string;
    location?: string;
    date?: string;
  };
  const photo = await updateGalleryPhoto(id, {
    title: body.title ?? "",
    location: body.location ?? "",
    date: body.date ?? ""
  });

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  return NextResponse.json({ photo });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await canManageGallery())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const wasDeleted = await deleteGalleryPhoto(id);

  if (!wasDeleted) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
