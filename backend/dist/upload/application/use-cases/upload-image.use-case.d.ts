import { ImageStoragePort, ImageUploadResult } from "../../domain/image-storage.port";
export declare class UploadImageUseCase {
    private readonly imageStorage;
    constructor(imageStorage: ImageStoragePort);
    execute(imageDataUrl: string, folder: string): Promise<ImageUploadResult>;
}
