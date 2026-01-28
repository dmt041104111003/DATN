"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import DashboardLayoutWrapper from "../../dashboard/layout"

export default function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return
    if (!pathname.startsWith("/agent/")) return
    if (user?.role !== "AGENT") router.replace("/enterprise/dashboard")
  }, [isLoading, pathname, router, user?.role])

  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
}

