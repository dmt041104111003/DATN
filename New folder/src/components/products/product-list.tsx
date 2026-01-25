"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteDialog } from "@/components/dashboard/delete-dialog"
import { ProductEditDialog } from "./product-edit-dialog"
import type { Product, Material, Certification, UpdateProductInput } from "@/types"

interface ProductListProps {
  products: Product[]
  materials: Material[]
  certifications: Certification[]
  onDelete: (id: string) => void
  onUpdate: (id: string, data: UpdateProductInput) => Promise<void>
  isUpdating?: boolean
}

export function ProductList({ 
  products, 
  materials, 
  certifications, 
  onDelete, 
  onUpdate,
  isUpdating 
}: ProductListProps) {
  const getUniqueSuppliers = (product: Product) => {
    if (!product.productMaterials || product.productMaterials.length === 0) return []
    const suppliers = product.productMaterials.map((pm) => pm.material.supplier)
    const unique = suppliers.filter(
      (s, index, self) => self.findIndex((x) => x.id === s.id) === index
    )
    return unique
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">All Products ({products.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Materials</TableHead>
                <TableHead>Suppliers</TableHead>
                <TableHead>Certifications</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const suppliers = getUniqueSuppliers(product)
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs">{product.id.slice(-8)}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      {product.productMaterials && product.productMaterials.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.productMaterials.map((pm) => (
                            <Badge key={pm.id} variant="secondary" className="text-xs">
                              {pm.material.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {suppliers.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {suppliers.map((supplier) => (
                            <Badge key={supplier.id} variant="outline" className="text-xs">
                              {supplier.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.productCertifications && product.productCertifications.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.productCertifications.map((pc) => (
                            <Badge key={pc.id} variant="default" className="text-xs">
                              {pc.certification?.certName}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {product.description || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <ProductEditDialog
                          product={product}
                          materials={materials}
                          certifications={certifications}
                          onUpdate={onUpdate}
                          isPending={isUpdating}
                        />
                        <DeleteDialog
                          itemName={product.name}
                          itemType="product"
                          onDelete={() => onDelete(product.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <div className="sm:hidden space-y-3">
          {products.map((product) => {
            const suppliers = getUniqueSuppliers(product)
            return (
              <div key={product.id} className="border rounded-md p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">#{product.id.slice(-8)}</span>
                    </div>
                    <p className="font-medium mt-1">{product.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {product.description || "No description"}
                    </p>
                    {product.productMaterials && product.productMaterials.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.productMaterials.map((pm) => (
                          <Badge key={pm.id} variant="secondary" className="text-xs">
                            {pm.material.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {suppliers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suppliers.map((supplier) => (
                          <Badge key={supplier.id} variant="outline" className="text-xs">
                            {supplier.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {product.productCertifications && product.productCertifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.productCertifications.map((pc) => (
                          <Badge key={pc.id} variant="default" className="text-xs">
                            {pc.certification?.certName}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <ProductEditDialog
                      product={product}
                      materials={materials}
                      certifications={certifications}
                      onUpdate={onUpdate}
                      isPending={isUpdating}
                    />
                    <DeleteDialog
                      itemName={product.name}
                      itemType="product"
                      onDelete={() => onDelete(product.id)}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
