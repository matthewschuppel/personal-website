import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact"
};

export default function ContactPage() {
  return (
    <PageShell eyebrow="Contact" title="Let’s make the next conversation easy.">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section className="surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-ink">Reach out</h2>
          <div className="mt-6 space-y-4 text-ink/70">
            <p className="flex items-center gap-3">
              <Mail size={18} className="text-clay" aria-hidden="true" />
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </p>
            <p className="flex items-center gap-3">
              <Phone size={18} className="text-clay" aria-hidden="true" />
              {siteConfig.phone}
            </p>
            <p className="flex items-center gap-3">
              <MapPin size={18} className="text-clay" aria-hidden="true" />
              {siteConfig.location}
            </p>
          </div>
        </section>
        <section className="rounded-lg border border-ink/10 bg-ink p-6 text-paper shadow-crisp">
          <h2 className="text-xl font-semibold">Profiles</h2>
          <div className="mt-6 grid gap-3">
            {siteConfig.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="inline-flex items-center justify-between rounded-md border border-paper/15 px-4 py-3 text-sm font-semibold transition hover:bg-paper hover:text-ink"
              >
                {social.label}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
