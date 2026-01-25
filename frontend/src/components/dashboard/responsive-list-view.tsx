"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ActionsDropdown } from '@/components/ui/actions-dropdown'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface ResponsiveListViewProps<T> {
  items: T[]
  columns: Column<T>[]
  actions?: (item: T) => {
    viewHref?: string
    onEdit?: () => void
    onDelete?: () => void
    onCancel?: () => void
  }
  mobileCardTitle?: (item: T) => React.ReactNode
  mobileCardDescription?: (item: T) => React.ReactNode
  mobileCardContent?: (item: T) => React.ReactNode
}

export function ResponsiveListView<T extends { id: string }>({
  items,
  columns,
  actions,
  mobileCardTitle,
  mobileCardDescription,
  mobileCardContent,
}: ResponsiveListViewProps<T>) {
  const router = useRouter()

  return (
    <>
      <div className="hidden md:block border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.key)} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
              {actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const itemActions = actions?.(item)
              return (
                <TableRow key={item.id}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={col.className}>
                      {col.render ? col.render(item) : String(item[col.key as keyof T] || '-')}
                    </TableCell>
                  ))}
                  {itemActions && (
                    <TableCell className="text-right">
                      <ActionsDropdown
                        viewHref={itemActions.viewHref}
                        onEdit={itemActions.onEdit}
                        onDelete={itemActions.onDelete}
                        onCancel={itemActions.onCancel}
                      />
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <div className="md:hidden space-y-2">
        {items.map((item) => {
          const itemActions = actions?.(item)
          return (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className={typeof mobileCardTitle?.(item) !== 'string' ? '' : undefined}>
                  {mobileCardTitle ? mobileCardTitle(item) : String(item[columns[0]?.key as keyof T] || '')}
                </CardTitle>
                {mobileCardDescription && (
                  <CardDescription>{mobileCardDescription(item)}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {mobileCardContent ? (
                  mobileCardContent(item)
                ) : (
                  <div className="space-y-2 text-sm">
                    {columns.slice(1).map((col) => (
                      <div key={String(col.key)}>
                        <span className="text-muted-foreground">{col.header}: </span>
                        {col.render ? col.render(item) : String(item[col.key as keyof T] || '-')}
                      </div>
                    ))}
                  </div>
                )}
                {itemActions && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {itemActions.viewHref && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={itemActions.viewHref}>View</Link>
                      </Button>
                    )}
                    {itemActions.onEdit && (
                      <Button variant="outline" size="sm" onClick={itemActions.onEdit} className="flex-1">
                        Edit
                      </Button>
                    )}
                    {itemActions.onCancel && (
                      <Button variant="outline" size="sm" onClick={itemActions.onCancel} className="flex-1">
                        Cancel
                      </Button>
                    )}
                    {itemActions.onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={itemActions.onDelete}
                        className="text-destructive hover:text-destructive flex-1"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
