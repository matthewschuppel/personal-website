import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, getDashboardPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const configuredPassword = getDashboardPassword();
  if (!configuredPassword) return NextResponse.json({ error: "Dashboard authentication is not configured." }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  if (typeof body.password !== "string" || body.password !== configuredPassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });
  return NextResponse.json({ ok: true });
}
