import { AuthService } from "../auth/auth.service";
import { UploadService } from "./upload.service";
export declare class UploadController {
    private readonly upload;
    private readonly auth;
    constructor(upload: UploadService, auth: AuthService);
    uploadImage(token?: string, body?: {
        imageDataUrl?: string;
        folder?: string;
    }): Promise<{
        url: string;
    }>;
}
