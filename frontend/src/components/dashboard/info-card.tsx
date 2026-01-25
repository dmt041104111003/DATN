"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InfoItem {
  label: string
  value: React.ReactNode
}

interface InfoCardProps {
  title: string
  items: InfoItem[]
}

export function InfoCard({ title, items }: InfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index}>
            <label className="text-sm font-medium text-muted-foreground">{item.label}</label>
            <p className="mt-1">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
