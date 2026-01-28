"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
  onDismiss?: () => void
}

export function Toast({ id, title, description, variant = 'default', onDismiss }: ToastProps) {
  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden rounded-lg border bg-background border-border text-foreground p-4 pr-8 shadow-lg transition-all animate-in slide-in-from-top-full",
        "min-w-[320px] max-w-full sm:min-w-[500px] sm:max-w-[600px]"
      )}
    >
      <div className="grid gap-1 flex-1 break-words overflow-wrap-anywhere">
        {title && (
          <div className="text-sm font-semibold leading-none">{title}</div>
        )}
        {description && (
          <div className="text-sm opacity-90 whitespace-normal break-words leading-relaxed">{description}</div>
        )}
      </div>
      {onDismiss && (
        <button
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none group-hover:opacity-100"
          onClick={onDismiss}
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  )
}
