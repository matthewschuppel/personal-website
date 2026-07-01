import type { Metadata } from "next";
import { Compass, Layers, ListChecks } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "About"
};

export default function AboutPage() {
  const principles = [
    {
      icon: Compass,
      title: "Clear direction",
      text: "Turn vague goals into visible next steps, owners, dates, and decision points."
    },
    {
      icon: Layers,
      title: "Useful systems",
      text: "Build lightweight structures that make repeated work easier without adding ceremony."
    },
    {
      icon: ListChecks,
      title: "Reliable follow-through",
      text: "Keep details organized so teams, households, and projects can keep momentum."
    }
  ];

  return (
    <PageShell eyebrow="About" title="A practical, systems-minded overview.">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="surface rounded-lg p-6">
          <p className="text-sm font-semibold text-ink">Currently</p>
          <p className="mt-3 text-ink/70">{siteConfig.availability}</p>
          <div className="mt-6 border-t border-ink/10 pt-6 text-sm text-ink/65">
            <p>{siteConfig.location}</p>
            <p>{siteConfig.email}</p>
          </div>
        </aside>
        <div className="space-y-6 text-lg leading-8 text-ink/72">
          <p>
            This site is built to be both a professional front door and a personal command center.
            The public side keeps the essentials easy to find. The private side gives everyday
            planning a calmer, more durable place to live.
          </p>
          <p>
            Replace this copy with your story: the kind of work you do, the problems you like, the
            values you bring into teams, and the personal context you want people to understand.
          </p>
          <p>
            The structure is intentionally simple so it can grow with you: add case studies,
            writing, embedded documents, or deeper dashboard integrations over time.
          </p>
        </div>
      </div>
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {principles.map((item) => (
          <article key={item.title} className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
            <item.icon size={24} className="text-clay" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-semibold text-ink">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-ink/65">{item.text}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
