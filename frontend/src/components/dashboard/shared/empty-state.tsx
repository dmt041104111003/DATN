"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'

interface EmptyStateProps {
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

export function EmptyState({ message, action, children }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-muted-foreground">{message}</p>
        {action && (
          <Button className="mt-4" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        {children}
      </CardContent>
    </Card>
  )
}
