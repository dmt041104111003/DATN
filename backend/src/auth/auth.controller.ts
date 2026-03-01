import { Body, Controller, Get, HttpException, HttpStatus, Patch, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";

function normalizeAddress(
  raw: string | { address?: string } | undefined
): string | undefined {
  if (typeof raw === "string") return raw;
  if (raw && typeof (raw as { address?: string }).address === "string") {
    return (raw as { address: string }).address;
  }
  return undefined;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("profiles")
  async listProfiles(@Query("token") token?: string) {
    if (!token) {
      throw new HttpException(
        { error: "Missing token" },
        HttpStatus.BAD_REQUEST
      );
    }
    return this.authService.listProfilesFromToken(token);
  }

  @Get("profiles/by-role")
  async listProfilesByRole(
    @Query("role") role?: string,
    @Query("token") token?: string,
  ) {
    if (!role?.trim()) {
      throw new HttpException(
        { error: "Missing role" },
        HttpStatus.BAD_REQUEST
      );
    }
    if (!token?.trim()) {
      throw new HttpException(
        { error: "Missing token" },
        HttpStatus.UNAUTHORIZED
      );
    }
    await this.authService.getProfileIdFromToken(token.trim());
    return this.authService.listProfilesByRoleCode(role.trim());
  }

  @Post("nonce")
  createNonce(
    @Body("stakeAddress") stakeAddress?: string | { address?: string }
  ): { nonce: string } {
    const addr = normalizeAddress(stakeAddress);
    if (!addr) {
      throw new HttpException(
        { error: "Missing stakeAddress" },
        HttpStatus.BAD_REQUEST
      );
    }
    const nonce = this.authService.generateNonce(addr);
    return { nonce };
  }

  @Post("verify")
  verifySignature(
    @Body()
    body: {
      stakeAddress?: string | { address?: string };
      nonce?: string;
      signature?: string;
      key?: string;
    }
  ) {
    const { stakeAddress, nonce, signature, key } = body;
    const addr = normalizeAddress(stakeAddress);

    if (!addr || !nonce || !signature || !key) {
      throw new HttpException(
        { error: "Missing authentication parameters" },
        HttpStatus.BAD_REQUEST
      );
    }

    return this.authService.verifyAndIssueToken({
      stakeAddress: addr,
      nonce,
      signature,
      key,
    });
  }

  @Post("profile")
  async createProfile(
    @Body()
    body: {
      stakeAddress?: string | { address?: string };
      roleId?: number;
      displayName?: string;
      location?: string;
      coordinates?: string;
    }
  ) {
    const { stakeAddress, roleId, displayName, location, coordinates } = body;
    const addr = normalizeAddress(stakeAddress);

    if (!addr || !roleId || !displayName) {
      throw new HttpException(
        { error: "Missing profile information" },
        HttpStatus.BAD_REQUEST
      );
    }

    return this.authService.createProfileAndIssueToken({
      stakeAddress: addr,
      roleId,
      displayName,
      location: location ?? undefined,
      coordinates: coordinates ?? undefined,
    });
  }

  @Patch("profile")
  async updateProfile(
    @Body()
    body: {
      token?: string;
      displayName?: string;
      location?: string;
      coordinates?: string;
    }
  ) {
    const { token, displayName, location, coordinates } = body;

    if (!token || !displayName) {
      throw new HttpException(
        { error: "Missing profile update information" },
        HttpStatus.BAD_REQUEST
      );
    }

    return this.authService.updateProfileFromToken({
      token,
      displayName,
      location,
      coordinates,
    });
  }

  @Post("profile/avatar")
  async uploadAvatar(
    @Body()
    body: {
      token?: string;
      imageDataUrl?: string;
    }
  ) {
    const { token, imageDataUrl } = body;

    if (!token || !imageDataUrl) {
      throw new HttpException(
        { error: "Missing avatar upload information" },
        HttpStatus.BAD_REQUEST
      );
    }

    return this.authService.uploadProfileAvatarFromToken({
      token,
      imageDataUrl,
    });
  }
}

