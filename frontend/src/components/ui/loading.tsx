"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
}

export function Loading({ className, size = "md", text }: LoadingProps) {
  const sizeClasses = {
    sm: "w-72 h-72",
    md: "w-96 h-96",
    lg: "w-[36rem] h-[36rem]",
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Image
        src="/loading.gif"
        alt="Loading"
        width={size === "sm" ? 288 : size === "md" ? 384 : 576}
        height={size === "sm" ? 288 : size === "md" ? 384 : 576}
        className={cn("object-contain", sizeClasses[size])}
        unoptimized
      />
      {text && (
        <span className={cn("text-muted-foreground font-medium", textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  )
}

export function LoadingPage({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading size="lg" text={text} />
    </div>
  )
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
      <Loading size="md" text={text} />
    </div>
  )
}
