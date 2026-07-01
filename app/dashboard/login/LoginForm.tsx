"use client";

import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";
import { login } from "@/app/dashboard/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <label className="block text-sm font-semibold text-ink" htmlFor="password">
        Dashboard password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="w-full rounded-md border border-ink/15 bg-white px-4 py-3 text-ink outline-none transition focus:border-moss focus:ring-4 focus:ring-moss/15"
        placeholder="Enter password"
      />
      {state?.error ? <p className="text-sm font-medium text-clay">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LockKeyhole size={17} aria-hidden="true" />
        {pending ? "Checking..." : "Unlock Dashboard"}
      </button>
    </form>
  );
}
