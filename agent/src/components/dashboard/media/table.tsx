"use client"

import { Media } from '@/types/media'
import { GatewayLink } from '@/components/ui/gateway-link'
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
import { MoreHorizontal, Trash2 } from 'lucide-react'

interface MediaTableProps {
  media: Media[]
  onDelete: (id: string) => void
}

const getCidFromUrl = (url: string): string => {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', '')
  }
  return ''
}

export function MediaTable({ media, onDelete }: MediaTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden md:table-cell">CID</TableHead>
            <TableHead className="hidden lg:table-cell">Upload Date</TableHead>
            <TableHead className="hidden lg:table-cell">URL</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {media.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No media files found
              </TableCell>
            </TableRow>
          ) : (
            media.map((item) => {
              const cid = getCidFromUrl(item.url)
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="truncate" title={item.name}>{item.name}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{item.type}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[150px]">
                    {cid ? (
                      <div className="font-mono text-xs truncate" title={cid}>{cid}</div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {new Date(item.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[200px]">
                    <div className="truncate">
                      <GatewayLink url={item.url} className="text-xs" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
