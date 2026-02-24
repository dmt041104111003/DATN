import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from "@nestjs/common";
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

    if (!stakeAddress || !roleId || !displayName || !glnCodeRoot) {
      throw new HttpException(
        { error: "Missing profile information" },
        HttpStatus.BAD_REQUEST
      );
    }

    return this.authService.createProfileAndIssueToken({
      stakeAddress,
      roleId,
      displayName,
      glnCodeRoot,
    });
  }
}

