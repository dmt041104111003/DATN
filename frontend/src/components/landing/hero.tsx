"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

const bgImages = Array.from({ length: 120 }, (_, i) => `/images/hero/${(i % 12) + 1}.png`)

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 -rotate-12 scale-150 origin-center">
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1">
          {bgImages.map((src, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-muted/30 aspect-[16/9] hover:bg-muted/60 transition-all duration-300"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover object-center opacity-20 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background/60 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pointer-events-none">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-center">
          What is HSupply?
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-2xl text-center">
          We believe product origin transparency should be accessible to everyone. That&apos;s why we created HSupply - a blockchain-powered traceability platform that helps you track product origins, verify authenticity, and ensure goods quality.
        </p>
        <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-xl text-center">
          Join businesses who&apos;ve discovered a better way to ensure product authenticity and origin transparency.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pointer-events-auto">
          <Link href="/trace">
            <Button size="lg" variant="secondary" className="gap-2">
              <Icon name="search" size="sm" />
              Trace Product
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="gap-2">
              <Icon name="login" size="sm" />
              Business Login
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
