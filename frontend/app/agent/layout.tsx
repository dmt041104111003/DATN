import { GovRouteLayout } from "@/features/public/shared/GovRouteLayout";
import type { ReactNode } from "react";

export default function AgentRouteLayout({ children }: { children: ReactNode }) {
  return <GovRouteLayout>{children}</GovRouteLayout>;
}
