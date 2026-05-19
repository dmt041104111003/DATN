import { GovRouteLayout } from "@/features/public/shared/GovRouteLayout";
import type { ReactNode } from "react";

export default function TraceScanLayout({ children }: { children: ReactNode }) {
  return <GovRouteLayout>{children}</GovRouteLayout>;
}
