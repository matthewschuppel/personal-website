import Link from "next/link";
import { siteConfig } from "@/data/site";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Resume", href: "/resume" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" }
];

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 text-sm lg:grid-cols-[1fr_auto_auto] lg:items-end">
        <div>
          <p className="text-lg font-semibold">{siteConfig.name}</p>
          <p className="mt-2 max-w-xl text-paper/65">{siteConfig.summary}</p>
          <p className="mt-4 text-paper/55">{siteConfig.location}</p>
        </div>
        <nav className="flex flex-wrap gap-3 lg:justify-end">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md px-2 py-1 font-medium text-paper/70 hover:bg-paper/10 hover:text-paper">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 text-paper/70 lg:text-right">
          <a href={`mailto:${siteConfig.email}`} className="block hover:text-paper">{siteConfig.email}</a>
          <p>{siteConfig.domain}</p>
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
