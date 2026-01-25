import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Suppliers",
  description: "Manage product origin sources - add and track your suppliers.",
}

export default function SuppliersLayout({ children }: { children: React.ReactNode }) {
  return children
}
