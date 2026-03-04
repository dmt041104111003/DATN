export interface Wallet {
    address: string;
    lastLogin: Date;
}
export interface Profile {
    id: number;
    walletAddress: string;
    roleCode: string;
    displayName: string;
    avatarUrl: string | null;
    location: string | null;
    coordinates: string | null;
}
export interface RoleOption {
    id: number;
    code: string;
}
export interface UpsertProfileParams {
    walletAddress: string;
    roleCode: string;
    displayName: string;
    location: string | null;
    coordinates: string | null;
}
export interface AuthRepositoryPort {
    upsertWallet(address: string, lastLogin: Date): Promise<Wallet>;
    findProfileByWalletAddress(address: string): Promise<Profile | null>;
    findAllRoles(): Promise<RoleOption[]>;
    upsertProfile(params: UpsertProfileParams): Promise<Profile>;
    findProfileRoleCodeById(profileId: number): Promise<string | null>;
}
export declare const AUTH_REPOSITORY = "AUTH_REPOSITORY";
