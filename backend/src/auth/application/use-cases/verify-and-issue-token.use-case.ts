import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { ConfigService } from "../../../core/config/config.service";
import { isPaymentAddress, normalizeStakeAddress } from "../../utils";
import {
  AUTH_REPOSITORY,
  AuthRepositoryPort,
} from "../../domain/auth.repository";
import { NONCE_STORE, NonceStorePort } from "../../domain/nonce-store.port";

type StakeAddress = string;

export interface VerifyAndIssueTokenParams {
  stakeAddress: StakeAddress;
  nonce: string;
  signature: string;
  key: string;
}

@Injectable()
export class VerifyAndIssueTokenUseCase {
  constructor(
    private readonly config: ConfigService,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort,
    @Inject(NONCE_STORE)
    private readonly nonceStore: NonceStorePort
  ) {}

  async execute(params: VerifyAndIssueTokenParams) {
    const { stakeAddress, nonce, signature, key } = params;
    const network = this.config.appNetwork === "mainnet" ? "mainnet" : "preprod";
    const addr = normalizeStakeAddress(stakeAddress, network);

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

    const wallet = await this.authRepository.upsertWallet(addr, new Date());

    const profile = await this.authRepository.findProfileByWalletAddress(
      wallet.address
    );

    if (!profile) {
      return {
        needProfile: true as const,
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
      role: profile.roleCode,
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
        role: profile.roleCode,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        location: profile.location ?? null,
        coordinates: profile.coordinates ?? null,
      },
    };
  }
}

