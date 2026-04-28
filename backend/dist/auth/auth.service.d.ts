import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export interface StakeAddressInput {
    address?: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly config;
    private readonly blockfrost;
    constructor(prisma: PrismaService, config: ConfigService);
    getRoles(): Promise<{
        id: number;
        code: any;
        name: any;
    }[]>;
    generateNonce(stakeAddress: string): Promise<string>;
    verifyAndIssueToken(data: {
        stakeAddress: string;
        nonce: string;
        signature: string;
        key: string;
    }): Promise<{
        needProfile: boolean;
        roles: {
            id: number;
            code: any;
            name: any;
        }[];
        token: string;
        profile?: undefined;
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
        needProfile?: undefined;
        roles?: undefined;
    }>;
    private normalizeStakeAddress;
    private isStakeAddress;
    private isSupportedAddress;
    private isPaymentAddress;
    private resolvePaymentAddress;
    private verifyWalletSignature;
}
