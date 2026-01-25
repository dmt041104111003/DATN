"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface NotFoundStateProps {
  message: string
  backHref: string
  backLabel?: string
}

export function NotFoundState({ message, backHref, backLabel = 'Back' }: NotFoundStateProps) {
  const router = useRouter()
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{message}</p>
          <Button className="mt-4" onClick={() => router.push(backHref)}>
            {backLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
