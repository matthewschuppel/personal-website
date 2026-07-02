import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { TravelGallery } from "@/components/TravelGallery";
import { canManageGallery } from "@/lib/gallery-auth";

export const metadata: Metadata = {
  title: "Gallery"
};

export default async function GalleryPage() {
  const canManage = await canManageGallery();

  return (
    <PageShell eyebrow="Gallery" title="Travel photos, memories, and places worth revisiting.">
      <TravelGallery canManage={canManage} />
    </PageShell>
  );
}
