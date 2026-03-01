import { Injectable, BadRequestException } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import { ConfigService } from "../config/config.service";

@Injectable()
export class UploadService {
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

  async uploadImage(imageDataUrl: string, folder: string): Promise<string> {
    const trimmed = (imageDataUrl || "").trim();
    if (!trimmed) {
      throw new BadRequestException("imageDataUrl is required.");
    }
    if (!this.config.cloudinaryCloudName) {
      throw new BadRequestException("Cloudinary is not configured.");
    }
    const uploadResult = await cloudinary.uploader.upload(trimmed, {
      folder: folder || "uploads",
      overwrite: true,
      invalidate: true,
    });
    return uploadResult.secure_url;
  }
}
