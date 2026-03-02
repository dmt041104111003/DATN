export interface ImageUploadRequest {
  imageDataUrl: string;
  folder: string;
}

export interface ImageUploadResult {
  url: string;
}

export interface ImageStoragePort {
  upload(request: ImageUploadRequest): Promise<ImageUploadResult>;
}

export const IMAGE_STORAGE = "IMAGE_STORAGE";

