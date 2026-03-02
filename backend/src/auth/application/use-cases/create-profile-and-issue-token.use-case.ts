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

type StakeAddress = string;

export interface CreateProfileAndIssueTokenParams {
  stakeAddress: StakeAddress;
  roleId: number;
  displayName: string;
  location?: string;
  coordinates?: string;
}

@Injectable()
export class CreateProfileAndIssueTokenUseCase {
  constructor(
    private readonly config: ConfigService,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort
  ) {}

  async execute(params: CreateProfileAndIssueTokenParams) {
    const { stakeAddress, roleId, displayName, location, coordinates } = params;
    const network = this.config.appNetwork === "mainnet" ? "mainnet" : "preprod";
    const addr = normalizeStakeAddress(stakeAddress, network);

    if (!isPaymentAddress(addr)) {
      throw new BadRequestException(
        "Address must be a payment address (addr_test1... or addr1...) or a valid hex (56, 58 or 114 chars).",
      );
    }

    const wallet = await this.authRepository.upsertWallet(addr, new Date());

    const role = await this.authRepository.findRoleById(roleId);

    if (!role) {
      throw new UnauthorizedException("Invalid role.");
    }

    const profile = await this.authRepository.upsertProfile({
      walletAddress: wallet.address,
      roleId: role.id,
      displayName,
      location: location ?? null,
      coordinates: coordinates ?? null,
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
}

