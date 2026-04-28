import type { Response } from 'express';
import { ProfileService } from './profile.service';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    private getWalletAddress;
    private getProfileId;
    private rethrow;
    private setAuthCookie;
    listProfiles(req: any): Promise<{
        id: any;
        walletAddress: any;
        roleCode: any;
        displayName: any;
        phoneNumber: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    listProfilesForAdmin(req: any, res: Response): Promise<{
        id: any;
        walletAddress: any;
        roleCode: any;
        displayName: any;
        phoneNumber: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    createProfile(body: any, req: any, res: Response): Promise<{
        id: any;
        walletAddress: any;
        roleCode: any;
        displayName: any;
        phoneNumber: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    } | {
        token: string;
        profile: {
            id: any;
            walletAddress: any;
            roleCode: any;
            displayName: any;
            phoneNumber: any;
            isActive: any;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    updateProfile(body: any, req: any): Promise<{
        id: any;
        walletAddress: any;
        roleCode: any;
        displayName: any;
        phoneNumber: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }>;
    getProfileById(req: any, _id: string): Promise<{
        id: any;
        walletAddress: any;
        roleCode: any;
        displayName: any;
        phoneNumber: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }>;
    replaceProfile(body: any, req: any, _id: string): Promise<{
        id: any;
        walletAddress: any;
        roleCode: any;
        displayName: any;
        phoneNumber: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }>;
    patchProfile(body: any, req: any, _id: string): Promise<{
        id: any;
        walletAddress: any;
        roleCode: any;
        displayName: any;
        phoneNumber: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }>;
}
