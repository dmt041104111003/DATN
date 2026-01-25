import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Materials",
  description: "Track raw material origins - manage materials and their sources.",
}

export default function MaterialsLayout({ children }: { children: React.ReactNode }) {
  return children
}
