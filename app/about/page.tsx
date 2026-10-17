import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Camera, Map, Stethoscope, Wrench } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: "Meet Matthew Schuppel, a Dallas-based biomedical engineer focused on clinical operations, employee onboarding, team training, and project ownership."
};

const interests = [
  { icon: Stethoscope, title: "Clinical technology", text: "Biomedical tools, clinical workflows, and patient-centered execution." },
  { icon: Wrench, title: "Personal systems", text: "Simple structures for keeping projects, documents, and plans organized." },
  { icon: Camera, title: "Photography", text: "Travel photos, editing workflows, and documenting places worth remembering." },
  { icon: Map, title: "Travel", text: "Planning efficient trips, useful itineraries, and memorable experiences." }
];

export default function AboutPage() {
  return (
    <PageShell eyebrow="About" title="Helping teams and clinical sites succeed.">
      <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-ink">{siteConfig.name}</h2>
          <p className="mt-3 text-sm font-semibold text-clay">{siteConfig.title}</p>
          <p className="mt-5 leading-7 text-ink/68">
            I’m a biomedical engineer based in Dallas, Texas, with 4+ years of experience in
            medical devices and clinical site operations. I have developed employee onboarding
            plans and trained new team members and clinical staff at two companies.
          </p>
          <p className="mt-4 leading-7 text-ink/68">
            As a Clinical Application Specialist at Carthera, I have activated and onboarded
            20+ U.S. clinical sites. I coordinate nationwide support, lead device demonstrations
            and clinician training, and maintain site relationships through ongoing procedures
            and treatments.
          </p>
          <p className="mt-4 leading-7 text-ink/68">
            Previously, at Renishaw Healthcare, I guided surgical teams through sEEG, deep brain
            stimulation, and laser interstitial thermal therapy workflows. I coordinated robotic
            system installations and preventive maintenance, delivered in-service training, and
            supported customer evaluations and neurosurgical conferences.
          </p>
          <p className="mt-4 leading-7 text-ink/68">
            I identify operational needs and take ownership of internal projects, from training
            procedures to tools for onboarding, team coordination, and clinical trial logistics.
            I work independently while partnering with clinical, R&amp;D, and quality teams.
            I earned my B.S. in Biomedical Engineering from the University of Oklahoma in 2021.
          </p>
          <Link
            href="/resume"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper transition hover:bg-moss"
          >
            View Resume
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
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
