"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, MapPin, Trash2 } from "lucide-react";

type GalleryPhoto = {
  id: string;
  title: string;
  location: string;
  date: string;
  imageUrl: string;
  createdAt: string;
};

type GalleryResponse = {
  photos: GalleryPhoto[];
};

function Field({
  label,
  value,
  onChange,
  disabled = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
        {label}
      </span>
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-moss focus:ring-4 focus:ring-moss/15 disabled:bg-mist disabled:text-ink/55"
      />
    </label>
  );
}

export function TravelGallery({ canManage }: { canManage: boolean }) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [draft, setDraft] = useState({
    title: "",
    location: "",
    date: ""
  });
  const [status, setStatus] = useState("Loading");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let isActive = true;

    fetch("/api/gallery")
      .then((response) => response.json() as Promise<GalleryResponse>)
      .then((data) => {
        if (!isActive) {
          return;
        }

        setPhotos(data.photos);
        setStatus(data.photos.length > 0 ? "Ready" : "No photos yet");
      })
      .catch(() => {
        if (isActive) {
          setStatus("Gallery unavailable");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setStatus("Uploading");

    try {
      const uploadedPhotos = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("title", draft.title || file.name.replace(/\.[^/.]+$/, ""));
          formData.append("location", draft.location);
          formData.append("date", draft.date);

          const response = await fetch("/api/gallery", {
            method: "POST",
            body: formData
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const data = (await response.json()) as { photo: GalleryPhoto };
          return data.photo;
        })
      );

      setPhotos((current) => [...uploadedPhotos, ...current]);
      setDraft({ title: "", location: "", date: "" });
      setStatus("Saved");
    } catch {
      setStatus("Upload failed");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function updatePhoto(
    id: string,
    key: keyof Pick<GalleryPhoto, "title" | "location" | "date">,
    value: string
  ) {
    setPhotos((current) =>
      current.map((photo) => (photo.id === id ? { ...photo, [key]: value } : photo))
    );
    setStatus("Saving");

    const nextPhoto = photos.find((photo) => photo.id === id);

    if (!nextPhoto) {
      return;
    }

    const response = await fetch(`/api/gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...nextPhoto, [key]: value })
    });

    setStatus(response.ok ? "Saved" : "Save failed");
  }

  async function removePhoto(id: string) {
    const previousPhotos = photos;
    setPhotos((current) => current.filter((photo) => photo.id !== id));
    setStatus("Deleting");

    const response = await fetch(`/api/gallery/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      setStatus("Saved");
    } else {
      setPhotos(previousPhotos);
      setStatus("Delete failed");
    }
  }

  return (
    <div>
      {canManage ? (
        <section className="surface rounded-lg p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Photo title"
                value={draft.title}
                onChange={(value) => setDraft((current) => ({ ...current, title: value }))}
                disabled={isUploading}
              />
              <Field
                label="Location"
                value={draft.location}
                onChange={(value) => setDraft((current) => ({ ...current, location: value }))}
                disabled={isUploading}
              />
              <Field
                label="Date"
                value={draft.date}
                onChange={(value) => setDraft((current) => ({ ...current, date: value }))}
                disabled={isUploading}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-md bg-mist px-3 py-2 text-sm font-semibold text-ink/70">
                {isUploading ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                {status}
              </span>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-moss">
                <ImagePlus size={16} aria-hidden="true" />
                Add photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploading}
                  onChange={addPhotos}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo) => (
          <article key={photo.id} className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-mist">
              <Image
                src={photo.imageUrl}
                alt={photo.title || "Travel photo"}
                fill
                unoptimized
                className="object-cover"
                sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="space-y-3 p-4">
              {canManage ? (
                <>
                  <Field
                    label="Title"
                    value={photo.title}
                    onChange={(value) => updatePhoto(photo.id, "title", value)}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Location"
                      value={photo.location}
                      onChange={(value) => updatePhoto(photo.id, "location", value)}
                    />
                    <Field
                      label="Date"
                      value={photo.date}
                      onChange={(value) => updatePhoto(photo.id, "date", value)}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold text-ink">{photo.title}</h2>
                  <p className="mt-1 text-sm text-ink/60">
                    {[photo.location, photo.date].filter(Boolean).join(" / ")}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between gap-3 border-t border-ink/10 pt-3">
                <p className="inline-flex min-w-0 items-center gap-2 text-sm text-ink/60">
                  <MapPin size={15} className="shrink-0 text-clay" aria-hidden="true" />
                  <span className="truncate">{photo.location || "Location not set"}</span>
                </p>
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="grid size-9 shrink-0 place-items-center rounded-md border border-ink/10 bg-white text-ink/60 transition hover:bg-clay hover:text-white"
                    aria-label={`Remove ${photo.title || "photo"}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
