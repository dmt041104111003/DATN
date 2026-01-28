"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={24} height={24} />
            <span className="text-lg font-bold uppercase tracking-tight">HSupply</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link 
              href="/" 
              className={cn(
                "text-sm font-medium transition-colors relative",
                isActive('/') ? "text-primary font-semibold" : "hover:text-primary"
              )}
            >
              Home
              {isActive('/') && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
              )}
            </Link>
            <Link 
              href="/trace" 
              className={cn(
                "text-sm font-medium transition-colors relative",
                isActive('/trace') ? "text-primary font-semibold" : "hover:text-primary"
              )}
            >
              Trace Product
              {isActive('/trace') && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
              )}
            </Link>
          </nav>

          <div className="flex items-center gap-4" />
        </div>
      </div>
    </header>
  )
}
