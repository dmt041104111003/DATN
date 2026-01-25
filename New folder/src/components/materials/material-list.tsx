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
import type { Material, Supplier } from "@/types"

interface MaterialListProps {
  materials: Material[]
  suppliers?: Supplier[]
  onDelete: (id: string) => void
}

export function MaterialList({ materials, suppliers, onDelete }: MaterialListProps) {
  const getSupplierName = (supplierId: string) => {
    return suppliers?.find((s) => s.id === supplierId)?.name || "-"
  }

  const formatDate = (date?: string) => {
    if (!date) return "-"
    const d = new Date(date)
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">All Materials ({materials.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Harvest Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-mono text-xs">{material.id.slice(-8)}</TableCell>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{getSupplierName(material.supplierId)}</TableCell>
                  <TableCell>{material.quantity}</TableCell>
                  <TableCell>{formatDate(material.harvestDate)}</TableCell>
                  <TableCell>
                    <DeleteDialog
                      itemName={material.name}
                      itemType="material"
                      onDelete={() => onDelete(material.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="sm:hidden space-y-3">
          {materials.map((material) => (
            <div key={material.id} className="border rounded-md p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-xs text-muted-foreground">#{material.id.slice(-8)}</span>
                  <p className="font-medium mt-1">{material.name}</p>
                  <div className="text-sm text-muted-foreground mt-1 grid grid-cols-2 gap-1">
                    <p>Supplier: {getSupplierName(material.supplierId)}</p>
                    <p>Qty: {material.quantity}</p>
                    <p>Harvest: {formatDate(material.harvestDate)}</p>
                  </div>
                </div>
                <DeleteDialog
                  itemName={material.name}
                  itemType="material"
                  onDelete={() => onDelete(material.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
