import { siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 text-sm sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-lg font-semibold">{siteConfig.name}</p>
          <p className="mt-2 max-w-xl text-paper/65">{siteConfig.summary}</p>
        </div>
        <div className="space-y-2 text-paper/70 sm:text-right">
          <p>{siteConfig.domain}</p>
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
