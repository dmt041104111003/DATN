import { Injectable, UnauthorizedException } from "@nestjs/common";
import { randomBytes } from "crypto";
import * as jwt from "jsonwebtoken";
import { ConfigService } from "../config/config.service";
import { PrismaService } from "../prisma/prisma.service";
import { v2 as cloudinary } from "cloudinary";

type StakeAddress = string;

@Injectable()
export class AuthService {
  private nonceStore = new Map<StakeAddress, string>();

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    const cloudName = this.config.cloudinaryCloudName;
    const apiKey = this.config.cloudinaryApiKey;
    const apiSecret = this.config.cloudinaryApiSecret;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  }

  generateNonce(stakeAddress: StakeAddress): string {
    const nonce = randomBytes(32).toString("hex");
    this.nonceStore.set(stakeAddress, nonce);
    return nonce;
  }

  async verifyAndIssueToken(params: {
    stakeAddress: StakeAddress;
    nonce: string;
    signature: string;
    key: string;
  }): Promise<
        | {
            token: string;
            profile: {
              id: number;
              role: string;
              displayName: string;
              avatarUrl: string | null;
              location: string | null;
              coordinates: string | null;
            };
          }
    | {
        needProfile: true;
        roles: { id: number; code: string }[];
      }
  > {
    const { stakeAddress, nonce, signature, key } = params;

    const expectedNonce = this.nonceStore.get(stakeAddress);
    if (!expectedNonce || expectedNonce !== nonce) {
      throw new UnauthorizedException("Invalid or expired nonce.");
    }

    this.nonceStore.delete(stakeAddress);

    if (!signature || !key) {
      throw new UnauthorizedException("Missing signature or public key.");
    }

    const wallet = await this.prisma.wallet.upsert({
      where: { address: stakeAddress },
      update: {
        lastLogin: new Date(),
      },
      create: {
        address: stakeAddress,
        lastLogin: new Date(),
      },
    });

    const profile = await this.prisma.profile.findFirst({
      where: { walletAddress: wallet.address },
      include: { role: true },
    });

    if (!profile) {
      const roles = await this.prisma.role.findMany({
        select: { id: true, code: true },
        orderBy: { id: "asc" },
      });

      return {
        needProfile: true,
        roles,
      };
    }

    const secret = this.config.jwtSecret;
    if (!secret) {
      throw new UnauthorizedException("JWT_SECRET is not configured.");
    }

    const payload = {
      sub: stakeAddress,
      stakeAddress,
      profileId: profile.id,
      role: profile.role.code,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
      coordinates: profile.coordinates,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });

    return {
      token,
      profile: {
        id: profile.id,
        role: profile.role.code,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        location: profile.location ?? null,
        coordinates: profile.coordinates ?? null,
      },
    };
  }

  async createProfileAndIssueToken(params: {
    stakeAddress: StakeAddress;
    roleId: number;
    displayName: string;
    location?: string;
    coordinates?: string;
  }): Promise<{
    token: string;
    profile: {
      id: number;
      role: string;
      displayName: string;
      avatarUrl: string | null;
      location: string | null;
      coordinates: string | null;
    };
  }> {
    const { stakeAddress, roleId, displayName, location, coordinates } = params;

    const wallet = await this.prisma.wallet.upsert({
      where: { address: stakeAddress },
      update: {
        lastLogin: new Date(),
      },
      create: {
        address: stakeAddress,
        lastLogin: new Date(),
      },
    });

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new UnauthorizedException("Invalid role.");
    }

    const profile = await this.prisma.profile.upsert({
      where: { walletAddress: wallet.address },
      update: {
        roleId: role.id,
        displayName,
        location: location ?? null,
        coordinates: coordinates ?? null,
      },
      create: {
        walletAddress: wallet.address,
        roleId: role.id,
        displayName,
        location: location ?? null,
        coordinates: coordinates ?? null,
      },
      include: { role: true },
    });

    const secret = this.config.jwtSecret;
    if (!secret) {
      throw new UnauthorizedException("JWT_SECRET is not configured.");
    }

    const payload = {
      sub: stakeAddress,
      stakeAddress,
      profileId: profile.id,
      role: profile.role.code,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
      coordinates: profile.coordinates,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });

    return {
      token,
      profile: {
        id: profile.id,
        role: profile.role.code,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        location: profile.location ?? null,
        coordinates: profile.coordinates ?? null,
      },
    };
  }

  async updateProfileFromToken(params: {
    token: string;
    displayName: string;
    location?: string;
    coordinates?: string;
  }): Promise<{
    token: string;
    profile: {
      id: number;
      role: string;
      displayName: string;
      avatarUrl: string | null;
      location: string | null;
      coordinates: string | null;
    };
  }> {
    const { token, displayName, location, coordinates } = params;

    const secret = this.config.jwtSecret;
    if (!secret) {
      throw new UnauthorizedException("JWT_SECRET is not configured.");
    }

    let payload: unknown;
    try {
      payload = jwt.verify(token, secret) as unknown;
    } catch {
      throw new UnauthorizedException("Invalid token.");
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      typeof (payload as any).profileId !== "number"
    ) {
      throw new UnauthorizedException("Invalid token payload.");
    }

    const profileId = (payload as any).profileId as number;

    const profile = await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        displayName,
        ...(location !== undefined && { location: location || null }),
        ...(coordinates !== undefined && { coordinates: coordinates || null }),
      },
      include: { role: true, wallet: true },
    });

    const nextPayload = {
      sub: profile.walletAddress,
      stakeAddress: profile.walletAddress,
      profileId: profile.id,
      role: profile.role.code,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
      coordinates: profile.coordinates,
    };

    const nextToken = jwt.sign(nextPayload, secret, { expiresIn: "7d" });

    return {
      token: nextToken,
      profile: {
        id: profile.id,
        role: profile.role.code,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        location: profile.location ?? null,
        coordinates: profile.coordinates ?? null,
      },
    };
  }

  async uploadProfileAvatarFromToken(params: {
    token: string;
    imageDataUrl: string;
  }): Promise<{
    token: string;
    profile: {
      id: number;
      role: string;
      displayName: string;
      avatarUrl: string | null;
      location: string | null;
      coordinates: string | null;
    };
  }> {
    const { token, imageDataUrl } = params;

    const secret = this.config.jwtSecret;
    if (!secret) {
      throw new UnauthorizedException("JWT_SECRET is not configured.");
    }

    let payload: unknown;
    try {
      payload = jwt.verify(token, secret) as unknown;
    } catch {
      throw new UnauthorizedException("Invalid token.");
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      typeof (payload as any).profileId !== "number"
    ) {
      throw new UnauthorizedException("Invalid token payload.");
    }

    const profileId = (payload as any).profileId as number;

    if (!this.config.cloudinaryCloudName) {
      throw new UnauthorizedException("Cloudinary is not configured.");
    }

    const uploadResult = await cloudinary.uploader.upload(imageDataUrl, {
      folder: "profiles",
      overwrite: true,
      invalidate: true,
    });

    const profile = await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        avatarUrl: uploadResult.secure_url,
      },
      include: { role: true, wallet: true },
    });

    const nextPayload = {
      sub: profile.walletAddress,
      stakeAddress: profile.walletAddress,
      profileId: profile.id,
      role: profile.role.code,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
      coordinates: profile.coordinates,
    };

    const nextToken = jwt.sign(nextPayload, secret, { expiresIn: "7d" });

    return {
      token: nextToken,
      profile: {
        id: profile.id,
        role: profile.role.code,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        location: profile.location ?? null,
        coordinates: profile.coordinates ?? null,
      },
    };
  }

  async getProfileIdFromToken(token: string): Promise<number> {
    const secret = this.config.jwtSecret;
    if (!secret) throw new UnauthorizedException("JWT_SECRET is not configured.");
    let payload: unknown;
    try {
      payload = jwt.verify(token, secret) as unknown;
    } catch {
      throw new UnauthorizedException("Invalid token.");
    }
    if (!payload || typeof payload !== "object" || typeof (payload as any).profileId !== "number") {
      throw new UnauthorizedException("Invalid token payload.");
    }
    return (payload as any).profileId as number;
  }

  async listProfilesFromToken(token: string): Promise<
    { walletAddress: string; displayName: string; location: string | null; coordinates: string | null }[]
  > {
    const secret = this.config.jwtSecret;
    if (!secret) throw new UnauthorizedException("JWT_SECRET is not configured.");
    let payload: unknown;
    try {
      payload = jwt.verify(token, secret) as unknown;
    } catch {
      throw new UnauthorizedException("Invalid token.");
    }
    if (!payload || typeof payload !== "object" || typeof (payload as any).profileId !== "number") {
      throw new UnauthorizedException("Invalid token payload.");
    }
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
    return profiles.map((p) => ({
      walletAddress: p.walletAddress,
      displayName: p.displayName,
      location: p.location ?? null,
      coordinates: p.coordinates ?? null,
      role: p.role?.code ?? null,
    }));
  }
}

