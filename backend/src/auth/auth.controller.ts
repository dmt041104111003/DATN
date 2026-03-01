import { Body, Controller, Get, HttpException, HttpStatus, Patch, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";

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

  @Post("nonce")
  createNonce(
    @Body("stakeAddress") stakeAddress?: string
  ): { nonce: string } {
    if (!stakeAddress) {
      throw new HttpException(
        { error: "Missing stakeAddress" },
        HttpStatus.BAD_REQUEST
      );
    }

    const nonce = this.authService.generateNonce(stakeAddress);
    return { nonce };
  }

  @Post("verify")
  verifySignature(
    @Body()
    body: {
      stakeAddress?: string;
      nonce?: string;
      signature?: string;
      key?: string;
    }
  ) {
    const { stakeAddress, nonce, signature, key } = body;

    if (!stakeAddress || !nonce || !signature || !key) {
      throw new HttpException(
        { error: "Missing authentication parameters" },
        HttpStatus.BAD_REQUEST
      );
    }

    return this.authService.verifyAndIssueToken({
      stakeAddress,
      nonce,
      signature,
      key,
    });
  }

  @Post("profile")
  async createProfile(
    @Body()
    body: {
      stakeAddress?: string;
      roleId?: number;
      displayName?: string;
      location?: string;
      coordinates?: string;
    }
  ) {
    const { stakeAddress, roleId, displayName, location, coordinates } = body;

    if (!stakeAddress || !roleId || !displayName) {
      throw new HttpException(
        { error: "Missing profile information" },
        HttpStatus.BAD_REQUEST
      );
    }

    return this.authService.createProfileAndIssueToken({
      stakeAddress,
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

