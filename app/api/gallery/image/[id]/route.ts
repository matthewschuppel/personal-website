import { getGalleryPhotoObject } from "@/lib/gallery-r2";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await getGalleryPhotoObject(id);

  if (!result) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(await result.object.arrayBuffer(), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type":
        result.object.httpMetadata?.contentType || result.photo.contentType || "image/jpeg"
    }
  });
}
