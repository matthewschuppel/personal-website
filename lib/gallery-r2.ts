import { getR2Bucket } from "@/lib/r2-storage";

export type GalleryPhoto = {
  id: string;
  title: string;
  location: string;
  date: string;
  objectKey: string;
  contentType: string;
  createdAt: string;
};

const INDEX_KEY = "gallery/index.json";
const PHOTO_PREFIX = "gallery/photos";

export type PublicGalleryPhoto = Omit<GalleryPhoto, "objectKey"> & {
  imageUrl: string;
};

function getBucket() {
  return getR2Bucket("GALLERY_BUCKET");
}

function toPublicPhoto(photo: GalleryPhoto): PublicGalleryPhoto {
  return {
    id: photo.id,
    title: photo.title,
    location: photo.location,
    date: photo.date,
    contentType: photo.contentType,
    createdAt: photo.createdAt,
    imageUrl: `/api/gallery/image/${photo.id}`
  };
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function listGalleryPhotos() {
  const bucket = getBucket();
  const indexObject = await bucket.get(INDEX_KEY);

  if (!indexObject) {
    return [];
  }

  try {
    const rawIndex = new TextDecoder().decode(await indexObject.arrayBuffer());
    const photos = JSON.parse(rawIndex) as GalleryPhoto[];
    return Array.isArray(photos) ? photos : [];
  } catch {
    return [];
  }
}

async function saveGalleryPhotos(photos: GalleryPhoto[]) {
  const bucket = getBucket();
  await bucket.put(INDEX_KEY, JSON.stringify(photos, null, 2), {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });
}

export async function listPublicGalleryPhotos() {
  const photos = await listGalleryPhotos();
  return photos.map(toPublicPhoto);
}

export async function addGalleryPhoto({
  file,
  title,
  location,
  date
}: {
  file: File;
  title: string;
  location: string;
  date: string;
}) {
  const bucket = getBucket();
  const id = crypto.randomUUID();
  const safeName = sanitizeFileName(file.name) || "photo";
  const contentType = file.type || "application/octet-stream";
  const objectKey = `${PHOTO_PREFIX}/${id}-${safeName}`;

  await bucket.put(objectKey, await file.arrayBuffer(), {
    httpMetadata: { contentType }
  });

  const photo: GalleryPhoto = {
    id,
    title: title || safeName.replace(/-/g, " "),
    location,
    date,
    objectKey,
    contentType,
    createdAt: new Date().toISOString()
  };

  const photos = await listGalleryPhotos();
  await saveGalleryPhotos([photo, ...photos]);

  return toPublicPhoto(photo);
}

export async function updateGalleryPhoto(
  id: string,
  updates: Pick<GalleryPhoto, "title" | "location" | "date">
) {
  const photos = await listGalleryPhotos();
  const updatedPhotos = photos.map((photo) =>
    photo.id === id ? { ...photo, ...updates } : photo
  );
  await saveGalleryPhotos(updatedPhotos);
  return updatedPhotos.find((photo) => photo.id === id);
}

export async function deleteGalleryPhoto(id: string) {
  const bucket = getBucket();
  const photos = await listGalleryPhotos();
  const photo = photos.find((item) => item.id === id);

  if (!photo) {
    return false;
  }

  await bucket.delete(photo.objectKey);
  await saveGalleryPhotos(photos.filter((item) => item.id !== id));
  return true;
}

export async function getGalleryPhotoObject(id: string) {
  const bucket = getBucket();
  const photos = await listGalleryPhotos();
  const photo = photos.find((item) => item.id === id);

  if (!photo) {
    return null;
  }

  const object = await bucket.get(photo.objectKey);

  if (!object) {
    return null;
  }

  return {
    object,
    photo
  };
}
