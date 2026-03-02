import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  AuthRepositoryPort,
  Profile,
  Role,
  UpsertProfileParams,
  Wallet,
} from "../domain/auth.repository";

@Injectable()
export class PrismaAuthRepository implements AuthRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async upsertWallet(address: string, lastLogin: Date): Promise<Wallet> {
    const wallet = await this.prisma.wallet.upsert({
      where: { address },
      update: { lastLogin },
      create: { address, lastLogin },
    });
    return {
      address: wallet.address,
      lastLogin: wallet.lastLogin ?? new Date(),
    };
  }

  async findProfileByWalletAddress(address: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findFirst({
      where: { walletAddress: address },
      include: { role: true },
    });
    if (!profile || !profile.role) return null;
    return {
      id: profile.id,
      walletAddress: profile.walletAddress,
      role: {
        id: profile.role.id,
        code: profile.role.code,
      },
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
      coordinates: profile.coordinates,
    };
  }

  async findAllRoles(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      select: { id: true, code: true },
      orderBy: { id: "asc" },
    });
    return roles;
  }

  async findRoleById(id: number): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) return null;
    return { id: role.id, code: role.code };
  }

  async upsertProfile(params: UpsertProfileParams): Promise<Profile> {
    const { walletAddress, roleId, displayName, location, coordinates } = params;
    const profile = await this.prisma.profile.upsert({
      where: { walletAddress },
      update: {
        roleId,
        displayName,
        location,
        coordinates,
      },
      create: {
        walletAddress,
        roleId,
        displayName,
        location,
        coordinates,
      },
      include: { role: true },
    });
    return {
      id: profile.id,
      walletAddress: profile.walletAddress,
      role: {
        id: profile.role.id,
        code: profile.role.code,
      },
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
      coordinates: profile.coordinates,
    };
  }

  async findProfileRoleCodeById(profileId: number): Promise<string | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { role: { select: { code: true } } },
    });
    return profile?.role?.code ?? null;
  }
}

