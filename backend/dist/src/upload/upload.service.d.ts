import { ConfigService } from "../config/config.service";
export declare class UploadService {
    private readonly config;
    constructor(config: ConfigService);
    uploadImage(imageDataUrl: string, folder: string): Promise<string>;
}
