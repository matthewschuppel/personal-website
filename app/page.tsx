import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { siteConfig } from "@/data/site";

const interests = ["Biomedical technology", "Photography", "Travel", "Home systems", "Useful AI tools"];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay">{siteConfig.location}</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-tight text-ink sm:text-7xl">
          {siteConfig.name}
        </h1>
        <p className="mt-5 text-2xl leading-9 text-ink/70">{siteConfig.title}</p>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/68">
          A biomedical engineer focused on practical systems, thoughtful execution, and clear
          communication across clinical, technical, and operational work.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/resume"
            className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-paper shadow-crisp transition hover:bg-moss"
          >
            View Resume
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-mist"
          >
            <LockKeyhole size={16} aria-hidden="true" />
            Enter MatthewOS
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-2">
        <article className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">About</h2>
          <p className="mt-3 text-sm leading-6 text-ink/65">
            I like building calm, reliable systems for complex work and everyday life. This public
            site is intentionally simple: a short introduction, resume, gallery, and contact path.
          </p>
        </article>
        <article className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Interests</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span key={interest} className="rounded-md bg-mist px-3 py-2 text-sm font-medium text-ink/70">
                {interest}
              </span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
