"use client"

import { Certification, CertificationTableProps } from '@/types/certification'
import { formatDateDisplay } from '@/lib/utils/crud-helpers'
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
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

export function CertificationTable({ certifications, onEdit, onDelete }: CertificationTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Certification Name</TableHead>
            <TableHead className="hidden md:table-cell">Issue Date</TableHead>
            <TableHead className="hidden lg:table-cell">Expiry Date</TableHead>
            <TableHead className="hidden lg:table-cell">Status</TableHead>
            <TableHead className="hidden lg:table-cell">Hash</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certifications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No certifications found
              </TableCell>
            </TableRow>
          ) : (
            certifications.map((certification) => (
              <TableRow key={certification.id}>
                <TableCell className="font-medium max-w-[200px]">
                  <div className="truncate" title={certification.certName}>{certification.certName}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDateDisplay(certification.issueDate)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {certification.expiryDate ? formatDateDisplay(certification.expiryDate) : <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {certification.productId ? (
                    <span className="text-green-600">Linked</span>
                  ) : (
                    <span className="text-muted-foreground">Not linked</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell max-w-[150px]">
                  {certification.certHash ? (
                    <div className="font-mono text-xs truncate" title={certification.certHash}>{certification.certHash}</div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(certification)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(certification.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
