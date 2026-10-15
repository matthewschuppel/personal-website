import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Camera, Map, Stethoscope, Wrench } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: "Meet Matthew Schuppel, a Dallas-based biomedical engineer with experience at Carthera and Renishaw Healthcare."
};

const interests = [
  { icon: Stethoscope, title: "Clinical technology", text: "Biomedical tools, clinical workflows, and patient-centered execution." },
  { icon: Wrench, title: "Personal systems", text: "Simple structures for keeping projects, documents, and plans organized." },
  { icon: Camera, title: "Photography", text: "Travel photos, editing workflows, and documenting places worth remembering." },
  { icon: Map, title: "Travel", text: "Planning efficient trips, useful itineraries, and memorable experiences." }
];

export default function AboutPage() {
  return (
    <PageShell eyebrow="About" title="Biomedical engineering in clinical practice.">
      <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-ink">{siteConfig.name}</h2>
          <p className="mt-3 text-sm font-semibold text-clay">{siteConfig.title}</p>
          <p className="mt-5 leading-7 text-ink/68">
            I’m a biomedical engineer based in Dallas, Texas, and a Clinical Application Specialist
            at Carthera. I support implantable neurosurgical devices in clinical trials, working
            with neurosurgeons, nurses, oncologists, and site teams across the U.S.
          </p>
          <p className="mt-4 leading-7 text-ink/68">
            At Carthera, I have activated and onboarded 20+ U.S. clinical sites. My work
            spans device demonstrations, clinician training, implantation and activation support,
            and ongoing technical troubleshooting.
          </p>
          <p className="mt-4 leading-7 text-ink/68">
            Previously, I was a Clinical Support Engineer at Renishaw Healthcare, supporting
            stereotactic neurosurgical robotics for sEEG, deep brain stimulation, and laser
            interstitial thermal therapy. I installed systems, trained surgical teams, and
            coordinated preventive maintenance and calibration.
          </p>
          <p className="mt-4 leading-7 text-ink/68">
            I take ownership of field support and internal projects with minimal supervision,
            while staying closely connected to clinical, R&amp;D, and quality teams. I earned my
            B.S. in Biomedical Engineering from the University of Oklahoma in 2021.
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
