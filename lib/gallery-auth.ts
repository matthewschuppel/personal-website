import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";

export async function canManageGallery() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === "true";
}
