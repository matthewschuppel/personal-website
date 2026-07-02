import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { TravelGallery } from "@/components/TravelGallery";

export const metadata: Metadata = {
  title: "Gallery"
};

export default function GalleryPage() {
  return (
    <PageShell eyebrow="Gallery" title="Travel photos, memories, and places worth revisiting.">
      <TravelGallery />
    </PageShell>
  );
}
