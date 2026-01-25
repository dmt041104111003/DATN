import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Trace Product",
  description: "Verify product authenticity and trace complete origin history using Policy ID and Asset Name.",
}

export default function TraceLayout({ children }: { children: React.ReactNode }) {
  return children
}
