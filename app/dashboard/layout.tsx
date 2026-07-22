import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { canUsePrivateDashboard } from "@/lib/gallery-auth";

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  if (!(await canUsePrivateDashboard())) redirect("/login");
  return children;
}
