import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Overview",
  description: "Dashboard overview - manage your products, collections, and suppliers.",
}

export default function DashboardPageLayout({ children }: { children: React.ReactNode }) {
  return children
}
