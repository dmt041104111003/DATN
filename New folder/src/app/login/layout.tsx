import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login",
  description: "Connect your Cardano wallet to access HSupply dashboard and manage product traceability.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
