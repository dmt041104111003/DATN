import { Inject, Injectable } from "@nestjs/common";
import { IMAGE_STORAGE, ImageStoragePort } from "./domain/image-storage.port";
import { UploadImageUseCase } from "./application/use-cases/upload-image.use-case";

@Injectable()
export class UploadService {
  constructor(
    @Inject(IMAGE_STORAGE)
    private readonly imageStorage: ImageStoragePort,
    private readonly uploadImageUseCase: UploadImageUseCase
  ) {}

  async uploadImage(imageDataUrl: string, folder: string): Promise<string> {
    const result = await this.uploadImageUseCase.execute(
      imageDataUrl,
      folder || "uploads"
    );
    return result.url;
  }
}
