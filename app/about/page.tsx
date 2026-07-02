import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Camera, Map, Stethoscope, Wrench } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "About"
};

const interests = [
  { icon: Stethoscope, title: "Clinical technology", text: "Biomedical tools, clinical workflows, and patient-centered execution." },
  { icon: Wrench, title: "Personal systems", text: "Simple structures for keeping projects, documents, and plans organized." },
  { icon: Camera, title: "Photography", text: "Travel photos, editing workflows, and documenting places worth remembering." },
  { icon: Map, title: "Travel", text: "Planning efficient trips, useful itineraries, and memorable experiences." }
];

export default function AboutPage() {
  return (
    <PageShell eyebrow="About" title="A concise professional introduction.">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section className="surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-ink">{siteConfig.name}</h2>
          <p className="mt-3 text-sm font-semibold text-clay">{siteConfig.title}</p>
          <p className="mt-5 leading-7 text-ink/68">
            I’m a biomedical engineer based in Dallas, TX, with experience across clinical support,
            application work, documentation, training, and cross-functional execution.
          </p>
          <Link
            href="/resume"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper transition hover:bg-moss"
          >
            View Resume
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          {interests.map((item) => (
            <article key={item.title} className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <item.icon size={22} className="text-clay" aria-hidden="true" />
              <h3 className="mt-4 font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/62">{item.text}</p>
            </article>
          ))}
        </section>
      </div>
    </PageShell>
  );
}
