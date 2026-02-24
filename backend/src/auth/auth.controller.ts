import { Body, Controller, HttpException, HttpStatus, Post, Patch } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      glnCodeRoot?: string;
    }
  ) {
    const { stakeAddress, roleId, displayName, glnCodeRoot } = body;

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
      glnCodeRoot: glnCodeRoot ?? "",
    });
  }

  @Patch("profile")
  async updateProfile(
    @Body()
    body: {
      token?: string;
      displayName?: string;
      glnCodeRoot?: string;
    }
  ) {
    const { token, displayName, glnCodeRoot } = body;

    if (!token || !displayName) {
      throw new HttpException(
        { error: "Missing profile update information" },
        HttpStatus.BAD_REQUEST
      );
    }

    return this.authService.updateProfileFromToken({
      token,
      displayName,
      glnCodeRoot: glnCodeRoot ?? "",
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

