import { Injectable, BadRequestException } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import { ConfigService } from "../../core/config/config.service";
import {
  ImageStoragePort,
  ImageUploadRequest,
  ImageUploadResult,
} from "../domain/image-storage.port";

@Injectable()
export class CloudinaryImageStorage implements ImageStoragePort {
  constructor(private readonly config: ConfigService) {
    const cloudName = this.config.cloudinaryCloudName;
    const apiKey = this.config.cloudinaryApiKey;
    const apiSecret = this.config.cloudinaryApiSecret;
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  }

  async upload(request: ImageUploadRequest): Promise<ImageUploadResult> {
    const trimmed = (request.imageDataUrl || "").trim();
    if (!trimmed) {
      throw new BadRequestException("imageDataUrl is required.");
    }
    if (!this.config.cloudinaryCloudName) {
      throw new BadRequestException("Cloudinary is not configured.");
    }
    const uploadResult = await cloudinary.uploader.upload(trimmed, {
      folder: request.folder || "uploads",
      overwrite: true,
      invalidate: true,
    });
    return { url: uploadResult.secure_url };
  }
}

