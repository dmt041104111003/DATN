import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Products",
  description: "Manage products for origin traceability - create, view and track your products.",
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
