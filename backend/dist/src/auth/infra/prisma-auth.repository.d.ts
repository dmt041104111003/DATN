import { PrismaService } from "../../prisma/prisma.service";
import { AuthRepositoryPort, Profile, Role, UpsertProfileParams, Wallet } from "../domain/auth.repository";
export declare class PrismaAuthRepository implements AuthRepositoryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upsertWallet(address: string, lastLogin: Date): Promise<Wallet>;
    findProfileByWalletAddress(address: string): Promise<Profile | null>;
    findAllRoles(): Promise<Role[]>;
    findRoleById(id: number): Promise<Role | null>;
    upsertProfile(params: UpsertProfileParams): Promise<Profile>;
    findProfileRoleCodeById(profileId: number): Promise<string | null>;
}
