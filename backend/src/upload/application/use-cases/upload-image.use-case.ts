import { Inject, Injectable } from "@nestjs/common";
import {
  IMAGE_STORAGE,
  ImageStoragePort,
  ImageUploadResult,
} from "../../domain/image-storage.port";

@Injectable()
export class UploadImageUseCase {
  constructor(
    @Inject(IMAGE_STORAGE)
    private readonly imageStorage: ImageStoragePort
  ) {}

  execute(imageDataUrl: string, folder: string): Promise<ImageUploadResult> {
    return this.imageStorage.upload({ imageDataUrl, folder });
  }
}

