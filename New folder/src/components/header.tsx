"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { useAuthStore } from "@/stores/auth.store"

export function Header() {
  const { isAuthenticated } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Logo" width={24} height={24} />
              <span className="text-sm font-semibold">HSupply</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Link href="/trace">
              <Button variant="ghost" size="sm" className="text-xs hidden sm:inline-flex">Trace Product</Button>
              <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8">
                <Icon name="search" size="sm" />
              </Button>
            </Link>
            {mounted && isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm" className="text-xs hidden sm:inline-flex">Dashboard</Button>
                <Button size="icon" className="sm:hidden h-8 w-8">
                  <Icon name="dashboard" size="sm" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" className="text-xs hidden sm:inline-flex">Login</Button>
                <Button size="icon" className="sm:hidden h-8 w-8">
                  <Icon name="login" size="sm" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export function SiteHeader() {
  return <Header />
}
