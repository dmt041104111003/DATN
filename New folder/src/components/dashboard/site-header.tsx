"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const routeTitles: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Products",
  batches: "Batches",
  shipments: "Shipments",
  agents: "Agents",
  suppliers: "Suppliers",
  materials: "Materials",
}

export function SiteHeader() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const currentPage = segments[segments.length - 1] || "dashboard"
  const pageTitle = routeTitles[currentPage] || currentPage

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4 md:hidden">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex items-center gap-2 flex-1">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={20} height={20} />
          <span className="text-sm font-semibold">HSupply</span>
        </Link>
      </div>
      <span className="text-sm text-muted-foreground">{pageTitle}</span>
    </header>
  )
}
