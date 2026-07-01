import type { LucideIcon } from "lucide-react";

export function DashboardCard({
  title,
  icon: Icon,
  items
}: {
  title: string;
  icon: LucideIcon;
  items: string[];
}) {
  return (
    <section className="surface rounded-lg p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-mist text-moss">
          <Icon size={20} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
      </div>
      <ul className="mt-4 space-y-3 text-sm text-ink/70">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 size-1.5 rounded-full bg-clay" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
