import { Body, Controller, HttpException, HttpStatus, Post } from "@nestjs/common";
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

}

