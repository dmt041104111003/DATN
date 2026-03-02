import { ImageStoragePort } from "./domain/image-storage.port";
import { UploadImageUseCase } from "./application/use-cases/upload-image.use-case";
export declare class UploadService {
    private readonly imageStorage;
    private readonly uploadImageUseCase;
    constructor(imageStorage: ImageStoragePort, uploadImageUseCase: UploadImageUseCase);
    uploadImage(imageDataUrl: string, folder: string): Promise<string>;
}
