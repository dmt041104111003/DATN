"use client"

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface DetailPageHeaderProps {
  title: string
  description: string
  backHref: string
}

export function DetailPageHeader({ title, description, backHref }: DetailPageHeaderProps) {
  const router = useRouter()
  
  return (
    <div>
      <Button variant="ghost" onClick={() => router.push(backHref)} className="mb-2">
        ← Back
      </Button>
      <h1 className="text-2xl sm:text-3xl font-bold mt-2 break-words">{title}</h1>
      <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">{description}</p>
    </div>
  )
}
