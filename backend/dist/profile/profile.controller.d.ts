import { AuthService } from "../auth/auth.service";
import { ProfileService } from "./profile.service";
export declare class ProfileController {
    private readonly profileService;
    private readonly authService;
    constructor(profileService: ProfileService, authService: AuthService);
    listProfiles(token?: string): Promise<{
        walletAddress: string;
        displayName: string;
        location: string | null;
        coordinates: string | null;
        role: string | null;
    }[]>;
    listProfilesByRole(role?: string, token?: string): Promise<{
        id: number;
        displayName: string;
        walletAddress: string;
    }[]>;
    updateProfile(body: {
        token?: string;
        displayName?: string;
        location?: string;
        coordinates?: string;
    }): Promise<{
        token: string;
        profile: {
            id: number;
            role: string;
            displayName: string;
            avatarUrl: string | null;
            location: string | null;
            coordinates: string | null;
        };
    }>;
    uploadAvatar(body: {
        token?: string;
        imageDataUrl?: string;
    }): Promise<{
        token: string;
        profile: {
            id: number;
            role: string;
            displayName: string;
            avatarUrl: string | null;
            location: string | null;
            coordinates: string | null;
        };
    }>;
}
