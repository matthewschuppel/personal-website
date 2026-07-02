import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";

export async function canManageGallery() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === "true";
}

export async function canUsePrivateDashboard() {
  // Placeholder for Cloudflare Access, Clerk, or Auth.js.
  // The dashboard is intentionally structured as private, but auth is simulated for now.
  return true;
}
