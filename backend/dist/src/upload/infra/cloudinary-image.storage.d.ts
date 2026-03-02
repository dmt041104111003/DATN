import { ConfigService } from "../../core/config/config.service";
import { ImageStoragePort, ImageUploadRequest, ImageUploadResult } from "../domain/image-storage.port";
export declare class CloudinaryImageStorage implements ImageStoragePort {
    private readonly config;
    constructor(config: ConfigService);
    upload(request: ImageUploadRequest): Promise<ImageUploadResult>;
}
