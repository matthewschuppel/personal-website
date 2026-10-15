import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { siteConfig } from "@/data/site";

const interests = ["Biomedical technology", "Photography", "Travel", "Home systems", "Useful AI tools"];

const focusAreas = [
  {
    title: "Clinical technology",
    text: "Support implantable and robotic neurosurgical devices in clinical trials and operating rooms."
  },
  {
    title: "Clinical site activation",
    text: "Activated and onboarded 20+ U.S. sites, with training for neurosurgeons, nurses, oncologists, and clinical staff."
  },
  {
    title: "Nationwide field support",
    text: "Independently coordinate on-site and remote support, troubleshoot devices, and keep clinical teams moving."
  }
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.75fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay">{siteConfig.location}</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-ink sm:text-7xl">
            {siteConfig.name}
          </h1>
          <p className="mt-5 max-w-2xl text-2xl leading-9 text-ink/70">{siteConfig.title}</p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/68">
            I’m a biomedical engineer and clinical application specialist with 4+ years of
            experience supporting neurosurgical devices. I help clinical teams launch new sites,
            learn device workflows, and resolve technical challenges across the U.S.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/resume"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-paper shadow-crisp hover:-translate-y-0.5 hover:bg-moss"
            >
              View Resume
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink hover:-translate-y-0.5 hover:bg-mist"
            >
              <Mail size={16} aria-hidden="true" />
              Contact
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white/70 px-5 py-3 text-sm font-semibold text-ink/75 hover:-translate-y-0.5 hover:bg-white"
            >
              <LockKeyhole size={16} aria-hidden="true" />
              MatthewOS
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-4 rounded-lg bg-mist" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-lg border border-ink/10 bg-white shadow-crisp">
            <Image
              src="/images/matthew-portrait.jpg"
              alt="Matthew Schuppel"
              width={900}
              height={1200}
              priority
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white/55">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-10 md:grid-cols-3">
          {focusAreas.map((area) => (
            <article key={area.title} className="rounded-lg border border-ink/10 bg-paper p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-crisp">
              <h2 className="font-semibold text-ink">{area.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/64">{area.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-12 md:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Engineering in clinical practice</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/65">
            At Carthera, I support clinical site activation, device training, and ongoing trial
            procedures. Previously, I supported neurosurgical robotics at Renishaw Healthcare.
            Across both roles, my work connects hands-on technical support with the needs of
            surgical teams.
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
