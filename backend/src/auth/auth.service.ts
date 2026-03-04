import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { ConfigService } from "../core/config/config.service";
import { AUTH_REPOSITORY, AuthRepositoryPort } from "./domain/auth.repository";
import { GenerateNonceUseCase } from "./application/use-cases/generate-nonce.use-case";
import {
  CreateProfileAndIssueTokenParams,
  CreateProfileAndIssueTokenUseCase,
} from "./application/use-cases/create-profile-and-issue-token.use-case";
import {
  VerifyAndIssueTokenParams,
  VerifyAndIssueTokenUseCase,
} from "./application/use-cases/verify-and-issue-token.use-case";

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort,
    private readonly generateNonceUseCase: GenerateNonceUseCase,
    private readonly verifyAndIssueTokenUseCase: VerifyAndIssueTokenUseCase,
    private readonly createProfileAndIssueTokenUseCase: CreateProfileAndIssueTokenUseCase
  ) {}

  generateNonce(stakeAddress: string): string {
    return this.generateNonceUseCase.execute(stakeAddress);
  }

  async verifyAndIssueToken(
    params: VerifyAndIssueTokenParams
  ): Promise<
        | {
            token: string;
            profile: {
              id: number;
              role: string;
              displayName: string;
              avatarUrl: string | null;
              location: string | null;
              coordinates: string | null;
            };
          }
        | {
            needProfile: true;
          }
  > {
    return this.verifyAndIssueTokenUseCase.execute(params);
  }

  async createProfileAndIssueToken(
    params: CreateProfileAndIssueTokenParams
  ): Promise<{
    token: string;
    profile: {
      id: number;
      role: string;
      displayName: string;
      avatarUrl: string | null;
      location: string | null;
      coordinates: string | null;
    };
  }> {
    return this.createProfileAndIssueTokenUseCase.execute(params);
  }

  async getProfileIdFromToken(token: string): Promise<number> {
    const secret = this.config.jwtSecret;
    if (!secret) throw new UnauthorizedException("JWT_SECRET is not configured.");
    let payload: unknown;
    try {
      payload = jwt.verify(token, secret) as unknown;
    } catch {
      throw new UnauthorizedException("Invalid token.");
    }
    if (!payload || typeof payload !== "object" || typeof (payload as any).profileId !== "number") {
      throw new UnauthorizedException("Invalid token payload.");
    }
    return (payload as any).profileId as number;
  }

  async getProfileRoleFromToken(token: string): Promise<string> {
    const profileId = await this.getProfileIdFromToken(token);
    const roleCode = await this.authRepository.findProfileRoleCodeById(profileId);
    if (!roleCode) throw new UnauthorizedException("Profile or role not found.");
    return roleCode;
  }
}

