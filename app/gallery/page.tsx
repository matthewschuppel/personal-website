import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDownToLine } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { mockGalleryItems } from "@/data/matthewos";

export const metadata: Metadata = {
  title: "Gallery"
};

const photos = mockGalleryItems.map((item, index) => ({
  id: item.id,
  title: item.title,
  description: item.location,
  image: item.image,
  fileName: `matthew-schuppel-photo-${index + 1}.png`
}));

export default function GalleryPage() {
  return (
    <PageShell eyebrow="Gallery" title="A simple place to view and download selected photos.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <article key={photo.id} className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-mist">
              <Image
                src={photo.image}
                alt={photo.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
            <div className="p-5">
              <h2 className="text-lg font-semibold text-ink">{photo.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/62">{photo.description}</p>
              <a
                href={photo.image}
                download={photo.fileName}
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-ink/10 bg-mist px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-white"
              >
                <ArrowDownToLine size={16} aria-hidden="true" />
                Download
              </a>
            </div>
          </article>
        ))}
      </div>
      {/* Future R2 integration: replace this local list with public image records from /api/gallery. */}
    </PageShell>
  );
}
