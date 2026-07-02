"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Download, ImagePlus, MapPin, Trash2, Upload } from "lucide-react";

type GalleryPhoto = {
  id: string;
  title: string;
  location: string;
  date: string;
  imageUrl: string;
};

const STORAGE_KEY = "travel-gallery-v1";

const starterPhotos: GalleryPhoto[] = [
  {
    id: "sample-1",
    title: "Lake morning",
    location: "Somewhere memorable",
    date: "2026",
    imageUrl: "/images/hero-workspace.png"
  }
];

function readPhotos() {
  if (typeof window === "undefined") {
    return starterPhotos;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return starterPhotos;
  }

  try {
    const parsed = JSON.parse(saved) as GalleryPhoto[];
    return Array.isArray(parsed) ? parsed : starterPhotos;
  } catch {
    return starterPhotos;
  }
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-moss focus:ring-4 focus:ring-moss/15"
      />
    </label>
  );
}

export function TravelGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(starterPhotos);
  const [isLoaded, setIsLoaded] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    location: "",
    date: ""
  });
  const [status, setStatus] = useState("Saved");

  useEffect(() => {
    setPhotos(readPhotos());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    setStatus("Saved");
  }, [isLoaded, photos]);

  const exportData = useMemo(() => JSON.stringify(photos, null, 2), [photos]);

  function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setStatus("Importing...");

    Promise.all(
      files.map(
        (file) =>
          new Promise<GalleryPhoto>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
              resolve({
                id: `${Date.now()}-${file.name}`,
                title: draft.title || file.name.replace(/\.[^/.]+$/, ""),
                location: draft.location,
                date: draft.date,
                imageUrl: String(reader.result)
              });
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          })
      )
    )
      .then((newPhotos) => {
        setPhotos((current) => [...newPhotos, ...current]);
        setDraft({ title: "", location: "", date: "" });
        setStatus("Saved");
      })
      .catch(() => setStatus("Upload failed"));

    event.target.value = "";
  }

  function updatePhoto(id: string, key: keyof Omit<GalleryPhoto, "id" | "imageUrl">, value: string) {
    setStatus("Saving...");
    setPhotos((current) =>
      current.map((photo) => (photo.id === id ? { ...photo, [key]: value } : photo))
    );
  }

  function removePhoto(id: string) {
    setStatus("Saving...");
    setPhotos((current) => current.filter((photo) => photo.id !== id));
  }

  function downloadGallery() {
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const linkElement = document.createElement("a");
    linkElement.href = url;
    linkElement.download = "travel-gallery.json";
    linkElement.click();
    URL.revokeObjectURL(url);
  }

  function importGallery(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as GalleryPhoto[];
        setPhotos(Array.isArray(parsed) ? parsed : starterPhotos);
        setStatus("Saved");
      } catch {
        setStatus("Import failed");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <div>
      <section className="surface rounded-lg p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Photo title"
              value={draft.title}
              onChange={(value) => setDraft((current) => ({ ...current, title: value }))}
            />
            <Field
              label="Location"
              value={draft.location}
              onChange={(value) => setDraft((current) => ({ ...current, location: value }))}
            />
            <Field
              label="Date"
              value={draft.date}
              onChange={(value) => setDraft((current) => ({ ...current, date: value }))}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-md bg-mist px-3 py-2 text-sm font-semibold text-ink/70">
              {status}
            </span>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-moss">
              <ImagePlus size={16} aria-hidden="true" />
              Add photos
              <input type="file" accept="image/*" multiple onChange={addPhotos} className="sr-only" />
            </label>
            <button
              type="button"
              onClick={downloadGallery}
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mist"
            >
              <Download size={16} aria-hidden="true" />
              Export
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mist">
              <Upload size={16} aria-hidden="true" />
              Import
              <input type="file" accept="application/json" onChange={importGallery} className="sr-only" />
            </label>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-ink/60">
          Photos save in this browser. Export your gallery file if you want a backup or want to move
          it to another device.
        </p>
      </section>

      <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo) => (
          <article key={photo.id} className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-mist">
              <Image
                src={photo.imageUrl}
                alt={photo.title || "Travel photo"}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                unoptimized={photo.imageUrl.startsWith("data:")}
              />
            </div>
            <div className="space-y-3 p-4">
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
              <div className="flex items-center justify-between gap-3 border-t border-ink/10 pt-3">
                <p className="inline-flex min-w-0 items-center gap-2 text-sm text-ink/60">
                  <MapPin size={15} className="shrink-0 text-clay" aria-hidden="true" />
                  <span className="truncate">{photo.location || "Location not set"}</span>
                </p>
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="grid size-9 shrink-0 place-items-center rounded-md border border-ink/10 bg-white text-ink/60 transition hover:bg-clay hover:text-white"
                  aria-label={`Remove ${photo.title || "photo"}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
