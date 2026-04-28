import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class ProfileService {
    private readonly prisma;
    private readonly config;
    constructor(prisma: PrismaService, config: ConfigService);
    private readonly userSelect;
    private mapProfileRow;
    private getAddress;
    private getSecret;
    private validatePaymentAddress;
    createProfile(custodianAddress: string, data: {
        roleCode: string;
        displayName: string;
        phoneNumber?: string;
    }): Promise<{
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
    updateProfile(accountId: string, data: {
        displayName?: string;
        phoneNumber?: string;
    }): Promise<{
        id: any;
        walletAddress: any;
        roleCode: any;
        displayName: any;
        phoneNumber: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }>;
    listProfiles(custodianAddress: string): Promise<{
        id: any;
        walletAddress: any;
        roleCode: any;
        displayName: any;
        phoneNumber: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    getProfileById(accountId: string): Promise<{
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
