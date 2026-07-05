import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
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
          <p className="mt-3 text-sm leading-6 text-ink/62">
            Email is the most reliable way to start a conversation. The form below opens your email
            app with a draft instead of sending anything through a backend service.
          </p>
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
          <form
            className="mt-8 grid gap-3"
            aria-label="Contact form"
            action={`mailto:${siteConfig.email}`}
            method="post"
            encType="text/plain"
          >
            {/* Future email integration: connect this form to Resend, SendGrid, Mailgun, or a Cloudflare Worker email flow. */}
            <input
              className="rounded-md border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-clay focus:ring-4 focus:ring-clay/10"
              placeholder="Your name"
              name="name"
            />
            <input
              className="rounded-md border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-clay focus:ring-4 focus:ring-clay/10"
              placeholder="Your email"
              name="email"
            />
            <textarea
              className="min-h-28 rounded-md border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-clay focus:ring-4 focus:ring-clay/10"
              placeholder="Message"
              name="message"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper hover:-translate-y-0.5 hover:bg-moss"
            >
              <MessageSquare size={16} aria-hidden="true" />
              Open Email Draft
            </button>
          </form>
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
