"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Icon name="error" size="xl" className="text-destructive" />
          <p className="mt-4 text-destructive text-sm sm:text-base text-center">{message}</p>
          <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
            <Icon name="refresh" size="sm" className="mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
