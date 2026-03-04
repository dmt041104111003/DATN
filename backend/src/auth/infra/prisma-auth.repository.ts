import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  AuthRepositoryPort,
  Profile,
  RoleOption,
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
    });
    if (!profile) return null;
    return {
      id: profile.id,
      walletAddress: profile.walletAddress,
      roleCode: profile.roleCode,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
      coordinates: profile.coordinates,
    };
  }

  async findAllRoles(): Promise<RoleOption[]> {
    return [
      { id: 1, code: "ENTERPRISE" },
      { id: 2, code: "TRANSIT" },
      { id: 3, code: "AGENT" },
      { id: 4, code: "SHIPPER" },
    ];
  }

  async upsertProfile(params: UpsertProfileParams): Promise<Profile> {
    const { walletAddress, roleCode, displayName, location, coordinates } = params;
    const profile = await this.prisma.profile.upsert({
      where: { walletAddress },
      update: {
        roleCode,
        displayName,
        location,
        coordinates,
      },
      create: {
        walletAddress,
        roleCode,
        displayName,
        location,
        coordinates,
      },
    });
    return {
      id: profile.id,
      walletAddress: profile.walletAddress,
      roleCode: profile.roleCode,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
      coordinates: profile.coordinates,
    };
  }

  async findProfileRoleCodeById(profileId: number): Promise<string | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { roleCode: true },
    });
    return profile?.roleCode ?? null;
  }
}

