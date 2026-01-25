"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteDialog } from "@/components/dashboard/delete-dialog"
import type { Supplier } from "@/types"

interface SupplierListProps {
  suppliers: Supplier[]
  onDelete: (id: string) => void
}

export function SupplierList({ suppliers, onDelete }: SupplierListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">All Suppliers ({suppliers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-mono text-xs">{supplier.id.slice(-8)}</TableCell>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.location || "-"}</TableCell>
                  <TableCell>{supplier.contactInfo || "-"}</TableCell>
                  <TableCell>
                    <DeleteDialog
                      itemName={supplier.name}
                      itemType="supplier"
                      onDelete={() => onDelete(supplier.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="sm:hidden space-y-3">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="border rounded-md p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-xs text-muted-foreground">#{supplier.id.slice(-8)}</span>
                  <p className="font-medium mt-1">{supplier.name}</p>
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    {supplier.location && <p>{supplier.location}</p>}
                    {supplier.contactInfo && <p>{supplier.contactInfo}</p>}
                  </div>
                </div>
                <DeleteDialog
                  itemName={supplier.name}
                  itemType="supplier"
                  onDelete={() => onDelete(supplier.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
