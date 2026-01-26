"use client"

import { useState } from 'react'
import { Document } from '@/types/api'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { SubListCard } from '../shared/sub-list-card'
import { GatewayLink } from '@/components/ui/gateway-link'
import { toGatewayUrl } from '@/components/ui/gateway-link'
import { Button } from '@/components/ui/button'

export function ProductDocuments({ productId, documents, onRefresh }: { productId: string; documents: Document[]; onRefresh: () => void }) {
  const [viewOpen, setViewOpen] = useState(false)
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null)

  const handleView = (doc: Document) => {
    setViewingDoc(doc)
    setViewOpen(true)
  }

  return (
    <>
      <SubListCard
        title="Documents"
        items={documents}
        columns={[
          { key: 'docType', header: 'Type', render: (d: Document) => <span className="font-medium">{d.docType}</span> },
          { key: 'url', header: 'URL', render: (d: Document) => (
            <GatewayLink url={d.url} className="block max-w-[300px]" />
          ), className: 'max-w-[300px]' },
          { key: 'hash', header: 'Hash', render: (d: Document) => <span className="font-mono text-xs">{d.hash || '-'}</span>, className: 'font-mono text-xs' },
        ]}
        actions={(doc: Document) => ({
          onView: () => handleView(doc),
        })}
        mobileCardTitle={(d: Document) => d.docType}
        mobileCardDescription={(d: Document) => (
          <GatewayLink url={d.url} className="text-xs" />
        )}
        emptyMessage="No documents"
        emptyContent={
          <p className="text-sm text-muted-foreground">
            Go to <a href="/dashboard/media" className="text-primary underline">Media & Documents</a> to add documents.
          </p>
        }
      />
      
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingDoc?.docType || 'Document Details'}</DialogTitle>
          </DialogHeader>
          {viewingDoc && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Type</Label>
                <p className="text-sm">{viewingDoc.docType}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">URL</Label>
                <GatewayLink url={viewingDoc.url} />
              </div>
              {viewingDoc.hash && (
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Hash</Label>
                  <p className="text-sm font-mono break-all">{viewingDoc.hash}</p>
                </div>
              )}
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Created At</Label>
                <p className="text-sm">{new Date(viewingDoc.createdAt).toLocaleString()}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Updated At</Label>
                <p className="text-sm">{new Date(viewingDoc.updatedAt).toLocaleString()}</p>
              </div>
              {(viewingDoc.url.endsWith('.pdf') || viewingDoc.url.includes('pdf')) && (
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Preview</Label>
                  <iframe
                    src={toGatewayUrl(viewingDoc.url)}
                    className="w-full h-96 border rounded"
                    title="Document preview"
                  />
                </div>
              )}
              {(viewingDoc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || viewingDoc.url.includes('image')) && (
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Preview</Label>
                  <img
                    src={toGatewayUrl(viewingDoc.url)}
                    alt={viewingDoc.docType}
                    className="w-full max-h-96 object-contain border rounded"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
            {viewingDoc && (
              <Button asChild>
                <a href={toGatewayUrl(viewingDoc.url)} target="_blank" rel="noopener noreferrer">
                  Open in New Tab
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
