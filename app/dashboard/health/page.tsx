import type { Metadata } from "next";
import { HealthDashboard } from "@/components/HealthDashboard";

export const metadata: Metadata = {
  title: "Health | MatthewOS"
};

export default function HealthPage() {
  return <HealthDashboard />;
}
