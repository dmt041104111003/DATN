"use client";

import { useMutation } from "@tanstack/react-query";
import { mediaRepository } from "@/lib/api/media.repository";

export function useUploadMedia() {
  return useMutation({
    mutationFn: (file: File) => mediaRepository.upload(file),
  });
}

export function useUploadMediaBatch() {
  return useMutation({
    mutationFn: (files: File[]) => mediaRepository.uploadBatch(files),
  });
}
