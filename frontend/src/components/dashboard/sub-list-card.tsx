"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { LoadingOverlay } from '@/components/ui/loading'
import { ResponsiveListView } from './responsive-list-view'

interface SubListCardProps<T extends { id: string }> {
  title: string
  items: T[]
  columns: Array<{
    key: keyof T | string
    header: string
    render?: (item: T) => React.ReactNode
    className?: string
  }>
  actions?: (item: T) => {
    viewHref?: string
    onView?: () => void
    onEdit?: () => void
    onDelete?: () => void
  }
  mobileCardTitle?: (item: T) => React.ReactNode
  mobileCardDescription?: (item: T) => React.ReactNode
  mobileCardContent?: (item: T) => React.ReactNode
  emptyMessage?: string
  emptyContent?: React.ReactNode
  dialogContent: React.ReactNode
  dialogOpen: boolean
  onDialogOpenChange: (open: boolean) => void
  dialogTrigger: React.ReactNode
  submitting?: boolean
  extraActions?: React.ReactNode
  viewDialog?: React.ReactNode
}

export function SubListCard<T extends { id: string }>({
  title,
  items,
  columns,
  actions,
  mobileCardTitle,
  mobileCardDescription,
  mobileCardContent,
  emptyMessage = 'No items',
  emptyContent,
  dialogContent,
  dialogOpen,
  onDialogOpenChange,
  dialogTrigger,
  submitting = false,
  extraActions,
  viewDialog,
}: SubListCardProps<T>) {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          {extraActions}
          <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
            <DialogTrigger asChild>
              {dialogTrigger}
            </DialogTrigger>
            <DialogContent>
              {submitting && <LoadingOverlay />}
              {dialogContent}
            </DialogContent>
          </Dialog>
        </div>
        {viewDialog}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          emptyContent || <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ResponsiveListView
            items={items}
            columns={columns}
            actions={actions}
            mobileCardTitle={mobileCardTitle}
            mobileCardDescription={mobileCardDescription}
            mobileCardContent={mobileCardContent}
          />
        )}
      </CardContent>
    </Card>
  )
}
