import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { siteConfig } from "@/data/site";

const featureCards = [
  {
    icon: Sparkles,
    title: "Public presence",
    text: "A simple home for your background, resume, contact details, and professional signal."
  },
  {
    icon: LayoutDashboard,
    title: "Private operating system",
    text: "A protected dashboard for the everyday references, plans, and routines that keep life moving."
  },
  {
    icon: ShieldCheck,
    title: "Deployment ready",
    text: "Environment-based password settings and Cloudflare deployment notes are included."
  }
];

const quickStats = [
  { label: "Public pages", value: "4" },
  { label: "Private modules", value: "10" },
  { label: "Customizable files", value: "2" }
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white/80 px-3 py-2 text-sm font-semibold text-ink/75 shadow-sm">
            <Sparkles size={16} className="text-clay" aria-hidden="true" />
            {siteConfig.location}
          </div>
          <h1 className="mt-6 text-5xl font-semibold leading-[0.94] tracking-tight text-ink sm:text-7xl">
            A personal website with a private command center.
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-ink/72">{siteConfig.title}</p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink/65">{siteConfig.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/resume"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-paper shadow-crisp transition hover:-translate-y-0.5 hover:bg-moss"
            >
              View Resume
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-white/75 px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
        <div className="surface overflow-hidden rounded-lg p-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-mist">
            <Image
              src="/images/hero-workspace.png"
              alt="A polished desk workspace with documents, notebook, and dashboard screen"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="grid gap-3 p-3 sm:grid-cols-3">
            {quickStats.map((stat) => (
              <div key={stat.label} className="rounded-md bg-paper p-4">
                <p className="text-2xl font-semibold text-ink">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white/55">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-10 md:grid-cols-3">
          {featureCards.map((card) => (
            <article key={card.title} className="rounded-lg border border-ink/10 bg-paper p-6 shadow-sm">
              <card.icon className="text-clay" size={26} aria-hidden="true" />
              <h2 className="mt-5 text-xl font-semibold text-ink">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cobalt">
            Built for everyday use
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
            Public signal up front. Private systems behind the lock.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: FileText,
              title: "Professional base",
              text: "About, resume, contact, and profile links are ready for your real details."
            },
            {
              icon: CalendarCheck,
              title: "Personal operations",
              text: "Calendar, tasks, travel, documents, wedding, home, and work resources live together."
            }
          ].map((item) => (
            <article key={item.title} className="surface rounded-lg p-6">
              <item.icon size={24} className="text-cobalt" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/65">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
