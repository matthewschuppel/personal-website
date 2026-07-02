import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { mockGalleryItems } from "@/data/matthewos";

export const metadata: Metadata = {
  title: "Gallery"
};

export default function GalleryPage() {
  return (
    <PageShell eyebrow="Gallery" title="A simple public gallery for photos, travel, and meaningful projects.">
      <div className="grid gap-5 md:grid-cols-2">
        {mockGalleryItems.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-mist">
              <Image
                src={item.image}
                alt={`${item.album} placeholder`}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority={item.id === "gallery-001"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" />
              <p className="absolute bottom-4 left-4 rounded-md bg-white/90 px-3 py-2 text-sm font-semibold text-ink">
                {item.album}
              </p>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-ink">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink/62">{item.location}</p>
                </div>
                <ArrowUpRight size={18} className="mt-1 text-clay" aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm leading-6 text-ink/62">
                Placeholder album prepared for future Cloudflare R2 image storage.
              </p>
            </div>
          </article>
        ))}
      </div>
      {/* Future R2 integration: replace mockGalleryItems with /api/gallery results and signed media URLs. */}
    </PageShell>
  );
}
