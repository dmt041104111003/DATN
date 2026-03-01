import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { randomBytes } from "crypto";
import * as jwt from "jsonwebtoken";
import { bech32 } from "bech32";
import { ConfigService } from "../config/config.service";
import { PrismaService } from "../prisma/prisma.service";

type StakeAddress = string;

function isPaymentAddress(addr: string): boolean {
  const s = (addr || "").trim();
  return s.startsWith("addr_test1") || s.startsWith("addr1");
}

function hexToBech32Address(
  hex: string,
  network: "mainnet" | "preprod"
): string | null {
  const raw = (hex || "").trim().toLowerCase();
  if (!/^[0-9a-f]+$/.test(raw)) return null;
  const len = raw.length;
  let bytes: Buffer;
  if (len === 56) {
    const pkh = Buffer.from(raw, "hex");
    const header = network === "mainnet" ? 0x21 : 0x20;
    bytes = Buffer.concat([Buffer.from([header]), pkh]);
  } else if (len === 58 || len === 114) {
    bytes = Buffer.from(raw, "hex");
  } else {
    return null;
  }
  try {
    const words = bech32.toWords(bytes as Uint8Array);
    const hrp = network === "mainnet" ? "addr" : "addr_test";
    return bech32.encode(hrp, words, 1000);
  } catch {
    return null;
  }
}

@Injectable()
export class AuthService {
  private nonceStore = new Map<StakeAddress, string>();

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  generateNonce(stakeAddress: StakeAddress): string {
    let addr = (stakeAddress || "").trim();
    if (!isPaymentAddress(addr)) {
      const network = this.config.appNetwork === "mainnet" ? "mainnet" : "preprod";
      const fromHex = hexToBech32Address(addr, network);
      if (fromHex) addr = fromHex;
    }
    if (!isPaymentAddress(addr)) {
      const hint =
        addr.length > 0
          ? ` Received: ${addr.slice(0, 30)}${addr.length > 30 ? "..." : ""}`
          : " Received empty or invalid type.";
      throw new BadRequestException(
        "Address must be a payment address (addr_test1... or addr1...) or a valid hex (56, 58 or 114 chars)." +
          hint,
      );
    }
    const nonce = randomBytes(32).toString("hex");
    this.nonceStore.set(addr, nonce);
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
    let addr = (stakeAddress || "").trim();
    if (!isPaymentAddress(addr)) {
      const network = this.config.appNetwork === "mainnet" ? "mainnet" : "preprod";
      const fromHex = hexToBech32Address(addr, network);
      if (fromHex) addr = fromHex;
    }
    if (!isPaymentAddress(addr)) {
      throw new BadRequestException(
        "Address must be a payment address (addr_test1... or addr1...) or a valid hex (56, 58 or 114 chars).",
      );
    }

    const expectedNonce = this.nonceStore.get(addr);
    if (!expectedNonce || expectedNonce !== nonce) {
      throw new UnauthorizedException("Invalid or expired nonce.");
    }

    this.nonceStore.delete(addr);

    if (!signature || !key) {
      throw new UnauthorizedException("Missing signature or public key.");
    }

    const wallet = await this.prisma.wallet.upsert({
      where: { address: addr },
      update: {
        lastLogin: new Date(),
      },
      create: {
        address: addr,
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
      sub: addr,
      stakeAddress: addr,
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
    let addr = (stakeAddress || "").trim();
    if (!isPaymentAddress(addr)) {
      const network = this.config.appNetwork === "mainnet" ? "mainnet" : "preprod";
      const fromHex = hexToBech32Address(addr, network);
      if (fromHex) addr = fromHex;
    }
    if (!isPaymentAddress(addr)) {
      throw new BadRequestException(
        "Address must be a payment address (addr_test1... or addr1...) or a valid hex (56, 58 or 114 chars).",
      );
    }

    const wallet = await this.prisma.wallet.upsert({
      where: { address: addr },
      update: {
        lastLogin: new Date(),
      },
      create: {
        address: addr,
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
      sub: addr,
      stakeAddress: addr,
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

  async getProfileRoleFromToken(token: string): Promise<string> {
    const profileId = await this.getProfileIdFromToken(token);
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { role: { select: { code: true } } },
    });
    if (!profile?.role?.code) throw new UnauthorizedException("Profile or role not found.");
    return profile.role.code;
  }
}

