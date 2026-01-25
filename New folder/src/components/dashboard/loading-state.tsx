"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function LoadingState() {
  return (
    <div className="space-y-4 px-4 lg:px-6">
      <Skeleton className="h-8 w-32 sm:w-48" />
      <Skeleton className="h-4 w-48 sm:w-64" />
      <Skeleton className="h-48 sm:h-64 w-full rounded-lg" />
    </div>
  )
}
