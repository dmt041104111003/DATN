import type { ReactNode } from "react";
import "./gov-bg.css";

export function GovRouteLayout({ children }: { children: ReactNode }) {
  return <div className="gov-bg min-h-screen">{children}</div>;
}
