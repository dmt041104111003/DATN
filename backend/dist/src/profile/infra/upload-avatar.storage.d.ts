import { UploadService } from "../../upload/upload.service";
import { AvatarStoragePort } from "../domain/avatar-storage.port";
export declare class UploadAvatarStorage implements AvatarStoragePort {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadAvatar(imageDataUrl: string): Promise<string>;
}
