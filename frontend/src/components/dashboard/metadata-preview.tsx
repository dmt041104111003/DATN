"use client"

import { Button } from '@/components/ui/button'

interface MetadataPreviewProps {
  metadata: any
  onHide: () => void
}

export function MetadataPreview({ metadata, onHide }: MetadataPreviewProps) {
  return (
    <div className="grid gap-4 border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Metadata Preview</h4>
        <Button type="button" variant="ghost" size="sm" onClick={onHide}>
          Hide
        </Button>
      </div>
      <div className="grid gap-3 text-sm">
        <div>
          <span className="font-medium">Name: </span>
          <span>{metadata.name}</span>
        </div>
        {metadata.documents && metadata.documents.length > 0 && (
          <div>
            <span className="font-medium">Documents: </span>
            <span>{metadata.documents.length} document(s)</span>
          </div>
        )}
        {metadata.materials && metadata.materials.length > 0 && (
          <div>
            <span className="font-medium">Materials: </span>
            <span>{metadata.materials.length} material(s)</span>
          </div>
        )}
        {metadata.productionProcesses && metadata.productionProcesses.length > 0 && (
          <div>
            <span className="font-medium">Production Processes: </span>
            <span>{metadata.productionProcesses.length} process(es)</span>
          </div>
        )}
        {metadata.certifications && metadata.certifications.length > 0 && (
          <div>
            <span className="font-medium">Certifications: </span>
            <span>{metadata.certifications.length} certification(s)</span>
          </div>
        )}
      </div>
    </div>
  )
}
