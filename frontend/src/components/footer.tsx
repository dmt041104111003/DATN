"use client"

import Link from "next/link"
import Image from "next/image"
import { Icon } from "@/components/ui/icon"
import { useAuth } from "@/contexts/auth-context"

export function Footer() {
  return (
    <footer className="border-t mt-8 sm:mt-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
          <div className="space-y-4 lg:max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Logo" width={28} height={28} />
              <span className="text-lg font-semibold">HSupply</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              HSupply is a product origin traceability platform built on Cardano blockchain. We help businesses verify authenticity and provide transparent origin information to consumers.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Follow Us</p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-foreground hover:text-muted-foreground">
                  <Icon name="public" size="md" />
                </a>
                <a href="#" className="text-foreground hover:text-muted-foreground">
                  <Icon name="smart_display" size="md" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-12 sm:gap-16">
            <div className="space-y-3">
              <p className="text-sm font-semibold">Platform</p>
              <Link href="/trace" className="block text-sm text-primary hover:underline">Trace Product</Link>
              <Link href="/login" className="block text-sm text-primary hover:underline">Business Login</Link>
              <a href="#" className="block text-sm text-primary hover:underline">Dashboard</a>
              <a href="#" className="block text-sm text-primary hover:underline">Pricing</a>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Ecosystem</p>
              <a href="https://cardano.org" target="_blank" rel="noopener noreferrer" className="block text-sm text-primary hover:underline">Cardano</a>
              <a href="#" className="block text-sm text-primary hover:underline">Developers & API</a>
              <a href="#" className="block text-sm text-primary hover:underline">Documentation</a>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Resources</p>
              <a href="#" className="block text-sm text-primary hover:underline">Blog</a>
              <a href="#" className="block text-sm text-primary hover:underline">Help Center</a>
              <a href="#" className="block text-sm text-primary hover:underline">FAQ</a>
              <a href="#" className="block text-sm text-primary hover:underline">Contact</a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Use of HSupply traceability services is subject to acceptance of the <a href="#" className="text-primary hover:underline">Terms of Service</a>. Product authenticity verification relies on data provided by registered businesses.
          </p>
        </div>
      </div>

      <div className="bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-primary">
            <span className="text-muted-foreground">© 2025 HSupply. All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
