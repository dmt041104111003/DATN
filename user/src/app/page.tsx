import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { FAQ } from "@/components/landing/faq"

export const metadata: Metadata = {
  title: "HSupply - Product Origin Traceability on Cardano",
  description: "Blockchain-powered product traceability. Verify product authenticity and trace complete origin history with NFTs on Cardano.",
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <Hero />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <Features />
        <FAQ />
      </main>

      <Footer />
    </div>
  )
}
