export interface Wallet {
    address: string;
    lastLogin: Date;
}
export interface Role {
    id: number;
    code: string;
}
export interface Profile {
    id: number;
    walletAddress: string;
    role: Role;
    displayName: string;
    avatarUrl: string | null;
    location: string | null;
    coordinates: string | null;
}
export interface UpsertProfileParams {
    walletAddress: string;
    roleId: number;
    displayName: string;
    location: string | null;
    coordinates: string | null;
}
export interface AuthRepositoryPort {
    upsertWallet(address: string, lastLogin: Date): Promise<Wallet>;
    findProfileByWalletAddress(address: string): Promise<Profile | null>;
    findAllRoles(): Promise<Role[]>;
    findRoleById(id: number): Promise<Role | null>;
    upsertProfile(params: UpsertProfileParams): Promise<Profile>;
    findProfileRoleCodeById(profileId: number): Promise<string | null>;
}
export declare const AUTH_REPOSITORY = "AUTH_REPOSITORY";
