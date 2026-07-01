import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { logout } from "@/app/dashboard/actions";
import { DashboardCard } from "@/components/DashboardCard";
import { dashboardSections, planningQueue, todayMetrics } from "@/data/dashboard";

export const metadata: Metadata = {
  title: "Dashboard"
};

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
      <div className="rounded-lg border border-ink/10 bg-ink p-6 text-paper shadow-soft sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber">
              Personal OS
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">Dashboard</h1>
            <p className="mt-4 max-w-2xl text-paper/68">
              A private command center for your day, household, travel, wedding, work resources,
              and the small details that deserve a reliable home.
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md border border-paper/15 bg-paper px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mist"
            >
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {todayMetrics.map((metric, index) => (
          <article
            key={metric.label}
            className={`rounded-lg border border-ink/10 p-5 shadow-sm ${
              index === 0 ? "bg-clay text-white" : "bg-white text-ink"
            }`}
          >
            <p className={`text-sm ${index === 0 ? "text-white/72" : "text-ink/55"}`}>
              {metric.label}
            </p>
            <p className="mt-2 text-4xl font-semibold">{metric.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {planningQueue.map((item) => (
          <article key={item.label} className="surface rounded-lg p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-mist text-moss">
                <item.icon size={20} aria-hidden="true" />
              </span>
              <h2 className="text-lg font-semibold text-ink">{item.label}</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/65">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardSections.map((section) => (
          <DashboardCard
            key={section.title}
            title={section.title}
            icon={section.icon}
            items={section.items}
          />
        ))}
      </section>
    </main>
  );
}
