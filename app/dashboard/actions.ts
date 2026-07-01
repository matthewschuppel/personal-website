"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, getDashboardPassword } from "@/lib/auth";

export async function login(_: { error?: string } | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (password !== getDashboardPassword()) {
    return { error: "That password did not match. Try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/dashboard/login");
}
