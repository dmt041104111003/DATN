"use client"

import { Subscription } from '@/types/subscription'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, X } from 'lucide-react'

interface SubscriptionsTableProps {
  subscriptions: Subscription[]
  onCancel: (id: string) => void
}

export function SubscriptionTable({ subscriptions, onCancel }: SubscriptionsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Start Date</TableHead>
            <TableHead className="hidden lg:table-cell">End Date</TableHead>
            <TableHead className="hidden lg:table-cell">Remaining</TableHead>
            <TableHead className="hidden lg:table-cell">Max Products</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No subscriptions found
              </TableCell>
            </TableRow>
          ) : (
            subscriptions.map((sub) => {
              const remainingDays = sub.endDate && sub.status === 'active' 
                ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                : null
              return (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="truncate" title={sub.service?.name || 'Unknown Service'}>
                      {sub.service?.name || 'Unknown Service'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {remainingDays !== null ? (
                      <span className="font-medium">{remainingDays} days</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {sub.service?.maxProducts === null ? 'Unlimited' : `${sub.service?.maxProducts} / day`}
                  </TableCell>
                  <TableCell>
                    {sub.status === 'active' ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onCancel(sub.id)} className="text-destructive">
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
