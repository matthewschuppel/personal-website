import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { logout } from "@/app/dashboard/actions";
import { EditableDashboard } from "@/components/EditableDashboard";

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

      <EditableDashboard />
    </main>
  );
}
