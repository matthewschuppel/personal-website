import type { Metadata } from "next";
import { WestWallDisplayManager } from "@/components/WestWallDisplayManager";

export const metadata: Metadata = {
  title: "WestWall Display Manager"
};

export default function WestWallPage() {
  return <WestWallDisplayManager />;
}
