"use client"

import { AgentTableProps } from '@/types/agent'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function AgentTable({ agents }: AgentTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Address</TableHead>
            <TableHead className="hidden lg:table-cell">GPS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                No agents found
              </TableCell>
            </TableRow>
          ) : (
            agents.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">
                  <div className="truncate max-w-[220px]" title={a.displayName || a.address}>
                    {a.displayName || '-'}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate max-w-[220px]" title={a.address}>
                    {a.address}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="truncate max-w-[320px]" title={a.location || ''}>
                    {a.location || '-'}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {a.gpsLatitude != null && a.gpsLongitude != null ? (
                    <span className="text-sm">{a.gpsLatitude}, {a.gpsLongitude}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

