"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Badge } from "@/components/ui/badge"
import type { Certification } from "@/types"

interface CertificationListProps {
  certifications: Certification[]
  onDelete: (id: string) => void
}

export function CertificationList({ certifications, onDelete }: CertificationListProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiry > new Date() && expiry <= thirtyDaysFromNow
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Certification</TableHead>
            <TableHead>Document</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certifications.map((cert) => (
            <TableRow key={cert.id}>
              <TableCell className="font-mono text-xs">{cert.id.slice(-8)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Icon name="verified" size="sm" className="text-primary" />
                  <span className="font-medium">{cert.certName}</span>
                </div>
              </TableCell>
              <TableCell>
                {cert.certHash && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(cert.certHash, '_blank')}
                  >
                    <Icon name="open_in_new" size="sm" className="mr-1" />
                    View
                  </Button>
                )}
              </TableCell>
              <TableCell>{formatDate(cert.issueDate)}</TableCell>
              <TableCell>
                {cert.expiryDate ? formatDate(cert.expiryDate) : "-"}
              </TableCell>
              <TableCell>
                {isExpired(cert.expiryDate) ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : isExpiringSoon(cert.expiryDate) ? (
                  <Badge variant="warning">Expiring Soon</Badge>
                ) : (
                  <Badge variant="success">Valid</Badge>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(cert.id)}
                >
                  <Icon name="delete" size="sm" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
