import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { siteConfig } from "@/data/site";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Resume", href: "/resume" },
  { label: "Contact", href: "/contact" },
  { label: "Dashboard", href: "/dashboard" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="group flex items-center gap-3 text-ink">
          <span className="grid size-9 place-items-center rounded-md bg-ink text-sm font-semibold text-paper shadow-crisp">
            {siteConfig.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </span>
          <span className="text-lg font-semibold tracking-tight transition group-hover:text-moss">
            {siteConfig.name}
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 font-medium text-ink/70 transition hover:bg-white hover:text-ink hover:shadow-sm ${
                item.href === "/dashboard" ? "border border-ink/10 bg-white/70 text-ink" : ""
              }`}
            >
              {item.href === "/dashboard" ? <LockKeyhole size={15} aria-hidden="true" /> : null}
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
