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
        { error: "Thiếu stakeAddress" },
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
  ): { token: string } {
    const { stakeAddress, nonce, signature, key } = body;

    if (!stakeAddress || !nonce || !signature || !key) {
      throw new HttpException(
        { error: "Thiếu tham số xác thực" },
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
}

