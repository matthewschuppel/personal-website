import { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-[70vh]">
      <section className="border-b border-ink/10 bg-white/45">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-ink sm:text-6xl">
            {title}
          </h1>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14">{children}</div>
    </main>
  );
}
