import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Dashboard Login"
};

export default function DashboardLoginPage() {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-5 py-16">
      <section className="w-full rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay">Private</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          Personal OS dashboard
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          Sign in to access planning, links, notes, documents, and personal resources.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
