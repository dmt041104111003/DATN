import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { ConfigService } from "../config/config.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "../auth/auth.service";
import { UploadService } from "../upload/upload.service";

@Injectable()
export class ProfileService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly upload: UploadService,
  ) {}

  async listProfilesFromToken(token: string): Promise<
    { walletAddress: string; displayName: string; location: string | null; coordinates: string | null; role: string | null }[]
  > {
    await this.auth.getProfileIdFromToken(token);

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

  async listProfilesByRoleCode(roleCode: string): Promise<{ id: number; displayName: string; walletAddress: string }[]> {
    const code = (roleCode || "").trim().toUpperCase();
    if (!code) return [];
    const role = await this.prisma.role.findUnique({ where: { code } });
    if (!role) return [];
    const profiles = await this.prisma.profile.findMany({
      where: { roleId: role.id },
      select: { id: true, displayName: true, walletAddress: true },
      orderBy: { displayName: "asc" },
    });
    return profiles.map((p) => ({
      id: p.id,
      displayName: p.displayName ?? "",
      walletAddress: p.walletAddress,
    }));
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

    const avatarUrl = await this.upload.uploadImage(imageDataUrl, "profiles");

    const profile = await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        avatarUrl,
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
}
