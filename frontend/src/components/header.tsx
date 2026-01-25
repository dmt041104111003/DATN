"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={24} height={24} />
            <span className="text-sm font-semibold">HSupply</span>
          </Link>

          <div className="flex items-center gap-2 ml-auto">
            <Link href="/trace">
              <Button variant="ghost" size="sm" className="text-xs hidden sm:inline-flex">Trace Product</Button>
              <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8">
                <Icon name="search" size="sm" />
              </Button>
            </Link>
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-xs hidden sm:inline-flex">Dashboard</Button>
                  <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8">
                    <Icon name="dashboard" size="sm" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} className="text-xs hidden sm:inline-flex">Logout</Button>
                <Button variant="ghost" size="icon" onClick={logout} className="sm:hidden h-8 w-8">
                  <Icon name="logout" size="sm" />
                </Button>
              </>
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
