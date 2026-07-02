import type { Metadata } from "next";
import { Download, Mail } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { resume, siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Resume"
};

export default function ResumePage() {
  return (
    <PageShell eyebrow="Resume" title="Experience, skills, education, and selected highlights.">
      <div className="mb-8 flex flex-wrap gap-3">
        <a
          href="/Matthew-Schuppel-Resume.pdf"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper transition hover:bg-moss"
        >
          <Download size={16} aria-hidden="true" />
          Download Resume PDF
        </a>
        <a
          href={`mailto:${siteConfig.email}`}
          className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-mist"
        >
          <Mail size={16} aria-hidden="true" />
          Contact
        </a>
      </div>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.6fr]">
        <aside className="space-y-4">
          <section className="surface rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ink">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span key={skill} className="rounded-md bg-mist px-3 py-2 text-sm font-medium text-ink/75">
                  {skill}
                </span>
              ))}
            </div>
          </section>
          <section className="surface rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ink">Education</h2>
            {resume.education.map((item) => (
              <div key={item.school} className="mt-4 text-sm leading-6 text-ink/70">
                <p className="font-semibold text-ink">{item.school}</p>
                <p>{item.degree}</p>
                <p>{item.years}</p>
              </div>
            ))}
          </section>
        </aside>
        <div className="space-y-6">
          <section className="surface rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ink">Professional Highlights</h2>
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
              <article key={`${item.company}-${item.role}`} className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
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
            <h2 className="text-lg font-semibold text-ink">Certifications & Focus Areas</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {["Clinical support", "Training documentation", "Process design", "AI-enabled workflows"].map((item) => (
                <p key={item} className="rounded-md bg-mist px-3 py-2 text-sm font-medium text-ink/70">
                  {item}
                </p>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
