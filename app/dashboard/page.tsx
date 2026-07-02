import type { Metadata } from "next";
import { MatthewOSDashboard } from "@/components/MatthewOSDashboard";

export const metadata: Metadata = {
  title: "MatthewOS"
};

export default function DashboardPage() {
  return <MatthewOSDashboard />;
}
