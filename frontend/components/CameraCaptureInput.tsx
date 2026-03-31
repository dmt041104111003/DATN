"use client";

import * as React from "react";
import { Camera, Loader2, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CameraCaptureInputProps = {
  disabled?: boolean;
  onCaptured: (file: File | null) => void;
  previewName?: string;
  openLabel?: string;
  captureLabel?: string;
  title?: string;
  closeSignal?: number;
  keepOpenAfterCapture?: boolean;
};

export function CameraCaptureInput({
  disabled = false,
  onCaptured,
  previewName,
  openLabel = "Open camera",
  captureLabel = "Take photo",
  title = "Camera",
  closeSignal = 0,
  keepOpenAfterCapture = false,
}: CameraCaptureInputProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  const stopStream = React.useCallback(() => {
    try {
      const s = streamRef.current;
      if (!s) return;
      s.getTracks().forEach((t) => t.stop());
    } catch {
      // ignore
    } finally {
      streamRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (!open) {
      stopStream();
      return;
    }

    let cancelled = false;
    const start = async () => {
      setLoading(true);
      setError("");
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = media;
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          // Some browsers need play() to be called explicitly.
          await videoRef.current.play().catch(() => {});
        }
      } catch (e: any) {
        setError(e?.message ? String(e.message) : "Unable to access camera.");
      } finally {
        setLoading(false);
      }
    };

    void start();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, stopStream]);

  React.useEffect(() => {
    if (!open) return;
    setOpen(false);
  }, [closeSignal]);

  const capture = React.useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;

    try {
      setLoading(true);
      setError("");
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth || 1280;
      canvas.height = v.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Unable to capture image.");
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

      const blob: Blob | null = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png");
      });

      if (!blob) throw new Error("Unable to capture image.");
      const file = new File([blob], `capture_${Date.now()}.png`, { type: blob.type || "image/png" });
      onCaptured(file);
      if (!keepOpenAfterCapture) setOpen(false);
    } catch (e: any) {
      setError(e?.message ? String(e.message) : "Capture failed.");
    } finally {
      setLoading(false);
    }
  }, [onCaptured, keepOpenAfterCapture]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setOpen(true);
          }}
        >
          <Camera className="mr-2 size-4" />
          {openLabel}
        </Button>

        {previewName ? (
          <span className="text-xs text-muted-foreground truncate">{previewName}</span>
        ) : (
          <span className="text-xs text-muted-foreground">No file</span>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="flex h-full w-full flex-col">
            <div className="border-b px-3 py-2 sm:px-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{title}</div>
                  <div className="text-xs text-muted-foreground">
                    Align the subject, then capture.
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  disabled={disabled || loading}
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4">
              <div className="mx-auto flex w-full max-w-2xl min-h-0 flex-1 flex-col justify-center gap-3">
                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-black">
                  <video
                    ref={videoRef}
                    className={cn("h-full w-full object-cover")}
                    playsInline
                    muted
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled || loading}
                  onClick={() => onCaptured(null)}
                >
                  <RotateCcw className="mr-2 size-4" />
                  Retake
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled || loading}
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={disabled || loading}
                    onClick={() => void capture()}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Camera className="mr-2 size-4" />
                    )}
                    {captureLabel}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

