"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  variant?: "default" | "primary" | "success" | "warning" | "destructive" | "muted"
  className?: string
}

const statusVariants: Record<string, { text: string }> = {
  active: { text: "text-primary" },
  minted: { text: "text-primary" },
  expired: { text: "text-orange-600" },
  cancelled: { text: "text-gray-500" },
  pending: { text: "text-yellow-600" },
  draft: { text: "text-muted-foreground" },
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const statusLower = status.toLowerCase()
  const variantStyle = variant === "primary" 
    ? { text: "text-primary" }
    : variant === "muted"
    ? { text: "text-muted-foreground" }
    : statusVariants[statusLower] || { text: "text-muted-foreground" }

  return (
    <span className={cn(
      "text-xs font-medium",
      variantStyle.text,
      className
    )}>
      {status}
    </span>
  )
}
