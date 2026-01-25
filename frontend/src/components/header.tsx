"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Header() {
  const { user, logout } = useAuth()
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
                "text-sm font-medium transition-colors",
                isActive('/') ? "text-primary" : "hover:text-primary"
              )}
            >
              Home
            </Link>
            <Link 
              href="/trace" 
              className={cn(
                "text-sm font-medium transition-colors",
                isActive('/trace') ? "text-primary" : "hover:text-primary"
              )}
            >
              Trace Product
            </Link>
            {user && (
              <Link 
                href="/dashboard" 
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive('/dashboard') ? "text-primary" : "hover:text-primary"
                )}
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:inline-flex">Logout</Button>
            ) : (
              <Link href="/login">
                <Button size="sm" className="hidden sm:inline-flex rounded-full px-6 bg-foreground text-background hover:bg-foreground/90">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
