import { PrismaService } from "../../prisma/prisma.service";
import { ProfileBasic, ProfileListItem, ProfileRepositoryPort, Role, UpdatedProfileWithRelations, UpdateProfileData } from "../domain/profile.repository";
export declare class PrismaProfileRepository implements ProfileRepositoryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listAllProfiles(): Promise<ProfileListItem[]>;
    findRoleByCode(code: string): Promise<Role | null>;
    listProfilesByRoleId(roleId: number): Promise<ProfileBasic[]>;
    updateProfileById(id: number, data: UpdateProfileData): Promise<UpdatedProfileWithRelations>;
    updateProfileAvatarById(id: number, avatarUrl: string): Promise<UpdatedProfileWithRelations>;
}
