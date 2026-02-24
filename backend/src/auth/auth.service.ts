import { Injectable, UnauthorizedException } from "@nestjs/common";
import { randomBytes } from "crypto";
import * as jwt from "jsonwebtoken";
import { ConfigService } from "../config/config.service";

type StakeAddress = string;

@Injectable()
export class AuthService {
  private nonceStore = new Map<StakeAddress, string>();

  constructor(private readonly config: ConfigService) {}

  generateNonce(stakeAddress: StakeAddress): string {
    const nonce = randomBytes(32).toString("hex");
    this.nonceStore.set(stakeAddress, nonce);
    return nonce;
  }

  verifyAndIssueToken(params: {
    stakeAddress: StakeAddress;
    nonce: string;
    signature: string;
    key: string;
  }): { token: string } {
    const { stakeAddress, nonce, signature, key } = params;

    const expectedNonce = this.nonceStore.get(stakeAddress);
    if (!expectedNonce || expectedNonce !== nonce) {
      throw new UnauthorizedException("Nonce không hợp lệ hoặc đã hết hạn.");
    }

    this.nonceStore.delete(stakeAddress);

    if (!signature || !key) {
      throw new UnauthorizedException("Thiếu chữ ký hoặc public key.");
    }

    const secret = this.config.jwtSecret;
    if (!secret) {
      throw new UnauthorizedException("JWT_SECRET không được cấu hình.");
    }

    const payload = { sub: stakeAddress, stakeAddress };
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });

    return { token };
  }
}

