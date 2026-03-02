import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  ProfileBasic,
  ProfileListItem,
  ProfileRepositoryPort,
  Role,
  UpdatedProfileWithRelations,
  UpdateProfileData,
} from "../domain/profile.repository";

@Injectable()
export class PrismaProfileRepository implements ProfileRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listAllProfiles(): Promise<ProfileListItem[]> {
    const profiles = await this.prisma.profile.findMany({
      select: {
        walletAddress: true,
        displayName: true,
        location: true,
        coordinates: true,
        role: { select: { code: true } },
      },
      orderBy: { displayName: "asc" },
    });
    return profiles.map(
      (p): ProfileListItem => ({
        walletAddress: p.walletAddress,
        displayName: p.displayName,
        location: p.location ?? null,
        coordinates: p.coordinates ?? null,
        role: p.role?.code ?? null,
      })
    );
  }

  async findRoleByCode(code: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { code },
    });
    if (!role) return null;
    return { id: role.id, code: role.code };
  }

  async listProfilesByRoleId(roleId: number): Promise<ProfileBasic[]> {
    const profiles = await this.prisma.profile.findMany({
      where: { roleId },
      select: { id: true, displayName: true, walletAddress: true },
      orderBy: { displayName: "asc" },
    });
    return profiles.map(
      (p): ProfileBasic => ({
        id: p.id,
        displayName: p.displayName ?? "",
        walletAddress: p.walletAddress,
      })
    );
  }

  async updateProfileById(
    id: number,
    data: UpdateProfileData
  ): Promise<UpdatedProfileWithRelations> {
    const profile = await this.prisma.profile.update({
      where: { id },
      data: {
        displayName: data.displayName,
        ...(data.location !== undefined && {
          location: data.location || null,
        }),
        ...(data.coordinates !== undefined && {
          coordinates: data.coordinates || null,
        }),
      },
      include: { role: true, wallet: true },
    });

    return {
      id: profile.id,
      displayName: profile.displayName,
      walletAddress: profile.walletAddress,
      avatarUrl: profile.avatarUrl ?? null,
      location: profile.location ?? null,
      coordinates: profile.coordinates ?? null,
      roleCode: profile.role.code,
    };
  }

  async updateProfileAvatarById(
    id: number,
    avatarUrl: string
  ): Promise<UpdatedProfileWithRelations> {
    const profile = await this.prisma.profile.update({
      where: { id },
      data: {
        avatarUrl,
      },
      include: { role: true, wallet: true },
    });

    return {
      id: profile.id,
      displayName: profile.displayName,
      walletAddress: profile.walletAddress,
      avatarUrl: profile.avatarUrl ?? null,
      location: profile.location ?? null,
      coordinates: profile.coordinates ?? null,
      roleCode: profile.role.code,
    };
  }
}

