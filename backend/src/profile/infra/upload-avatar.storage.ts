import { Injectable } from "@nestjs/common";
import { UploadService } from "../../upload/upload.service";
import { AvatarStoragePort } from "../domain/avatar-storage.port";

@Injectable()
export class UploadAvatarStorage implements AvatarStoragePort {
  constructor(private readonly uploadService: UploadService) {}

  uploadAvatar(imageDataUrl: string): Promise<string> {
    return this.uploadService.uploadImage(imageDataUrl, "profiles");
  }
}

