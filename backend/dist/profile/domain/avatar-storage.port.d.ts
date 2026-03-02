export interface AvatarStoragePort {
    uploadAvatar(imageDataUrl: string): Promise<string>;
}
export declare const AVATAR_STORAGE = "AVATAR_STORAGE";
