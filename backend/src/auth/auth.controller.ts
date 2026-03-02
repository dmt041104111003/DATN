import { Body, Controller, HttpException, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { normalizeAddress, StakeAddressInput } from "./utils";
import { NonceRequestDto } from "./dto/nonce.dto";
import { VerifySignatureDto } from "./dto/verify-signature.dto";
import { CreateProfileDto } from "./dto/create-profile.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("nonce")
  createNonce(@Body() body: NonceRequestDto): { nonce: string } {
    const addr = normalizeAddress(body.stakeAddress as StakeAddressInput);
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
    @Body() body: VerifySignatureDto
  ) {
    const { stakeAddress, nonce, signature, key } = body;
    const addr = normalizeAddress(stakeAddress as StakeAddressInput);

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
    @Body() body: CreateProfileDto
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

