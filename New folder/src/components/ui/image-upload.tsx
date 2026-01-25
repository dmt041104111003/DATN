"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icon } from "@/components/ui/icon"
import { mediaRepository } from "@/lib/api/media.repository"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  label?: string
  value?: string
  onChange: (url: string) => void
  className?: string
}

export function ImageUpload({ label = "Image", value, onChange, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setError(null)
    setUploading(true)

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    try {
      const result = await mediaRepository.upload(file)
      console.log('[ImageUpload] Upload result:', result)
      console.log('[ImageUpload] Gateway URL:', result.gatewayUrl)
      onChange(result.gatewayUrl)
      setPreview(result.gatewayUrl)
      setImgError(false)
    } catch (err) {
      console.error('[ImageUpload] Upload error:', err)
      setError(err instanceof Error ? err.message : "Upload failed")
      setPreview(null)
    } finally {
      setUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  const handleRemove = () => {
    onChange("")
    setPreview(null)
    setError(null)
  }

  const displayImage = preview || value

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      
      {displayImage ? (
        <div className="relative w-full aspect-video rounded-lg border overflow-hidden bg-muted">
          {imgError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <Icon name="broken_image" size="lg" className="text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground text-center break-all">
                Failed to load: {displayImage.slice(0, 50)}...
              </p>
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={displayImage}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgError(true)}
              onLoad={() => setImgError(false)}
            />
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <Icon name="edit" size="sm" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="h-8 w-8"
              onClick={handleRemove}
              disabled={uploading}
            >
              <Icon name="close" size="sm" />
            </Button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="progress_activity" size="sm" className="animate-spin" />
                Uploading...
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "relative w-full aspect-video rounded-lg border-2 border-dashed",
            "flex flex-col items-center justify-center gap-2 cursor-pointer",
            "hover:border-primary/50 hover:bg-muted/50 transition-colors",
            uploading && "pointer-events-none opacity-50"
          )}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Icon name="progress_activity" size="lg" className="animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </>
          ) : (
            <>
              <Icon name="cloud_upload" size="lg" className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload image</span>
              <span className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP (max 10MB)</span>
            </>
          )}
        </div>
      )}

      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
