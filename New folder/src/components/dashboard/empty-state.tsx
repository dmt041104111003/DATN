"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

interface EmptyStateProps {
  icon: string
  message: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, message, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Icon name={icon} size="xl" className="text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">{message}</p>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground text-center">{description}</p>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-4">{actionLabel}</Button>
        )}
      </CardContent>
    </Card>
  )
}
