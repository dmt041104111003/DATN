"use client"

import { Icon } from "@/components/ui/icon"

export default function SalesPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sales</h1>
        <p className="text-muted-foreground">Record sales and burn tokens</p>
      </div>

      <div className="rounded-lg border bg-card p-8 text-center">
        <Icon name="point_of_sale" size="lg" className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold">No sales recorded</h3>
        <p className="text-sm text-muted-foreground">
          When you sell products, record them here to update the blockchain.
        </p>
      </div>
    </div>
  )
}
