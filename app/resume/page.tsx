import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { resume, siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Resume"
};

export default function ResumePage() {
  return (
    <PageShell eyebrow="Resume" title="Experience, skills, and selected highlights.">
      <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        <aside className="space-y-6">
          <section className="surface rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ink">Contact</h2>
            <div className="mt-4 space-y-2 text-sm text-ink/70">
              <p>{siteConfig.email}</p>
              <p>{siteConfig.phone}</p>
              <p>{siteConfig.location}</p>
            </div>
          </section>
          <section className="surface rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ink">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span key={skill} className="rounded-md bg-mist px-3 py-1.5 text-sm font-medium text-ink/75">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </aside>
        <div className="space-y-8">
          <section className="surface rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ink">Highlights</h2>
            <ul className="mt-4 space-y-3 text-ink/70">
              {resume.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3">
                  <span className="mt-2 size-1.5 rounded-full bg-clay" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="space-y-4">
            {resume.experience.map((item) => (
              <article key={`${item.company}-${item.role}`} className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-crisp">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h2 className="text-xl font-semibold text-ink">{item.role}</h2>
                  <p className="text-sm font-medium text-clay">{item.years}</p>
                </div>
                <p className="mt-1 text-sm font-semibold text-ink/60">{item.company}</p>
                <p className="mt-4 leading-7 text-ink/70">{item.description}</p>
              </article>
            ))}
          </section>
          <section className="surface rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ink">Education</h2>
            {resume.education.map((item) => (
              <div key={item.school} className="mt-4 text-ink/70">
                <p className="font-semibold text-ink">{item.school}</p>
                <p>{item.degree}</p>
                <p>{item.years}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </PageShell>
  );
}
