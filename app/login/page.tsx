"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const password = new FormData(event.currentTarget).get("password");
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const body = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setError(body.error || "Sign-in failed.");
      setBusy(false);
      return;
    }
    window.location.assign("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12 text-ink">
      <section className="w-full max-w-md rounded-3xl border border-ink/10 bg-white/90 p-7 shadow-crisp">
        <span className="inline-flex rounded-2xl bg-ink p-3 text-paper"><LockKeyhole size={22} /></span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-clay">Private MatthewOS</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back.</h1>
        <p className="mt-2 text-sm leading-6 text-ink/55">Enter your dashboard password to continue.</p>
        <form onSubmit={signIn} className="mt-6 space-y-3">
          <input autoFocus required name="password" type="password" autoComplete="current-password" placeholder="Dashboard password" className="min-h-12 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm outline-none focus:border-clay focus:ring-4 focus:ring-clay/10" />
          {error ? <p className="text-sm text-clay" role="alert">{error}</p> : null}
          <button disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-paper disabled:opacity-50">{busy ? "Signing in…" : "Open MatthewOS"}<ArrowRight size={16} /></button>
        </form>
      </section>
    </main>
  );
}
