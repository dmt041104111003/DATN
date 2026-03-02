export interface AvatarStoragePort {
  uploadAvatar(imageDataUrl: string): Promise<string>;
}

export const AVATAR_STORAGE = "AVATAR_STORAGE";

