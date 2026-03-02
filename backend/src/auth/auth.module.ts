import { Module } from "@nestjs/common";
import { ConfigModule } from "../core/config/config.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AUTH_REPOSITORY } from "./domain/auth.repository";
import { PrismaAuthRepository } from "./infra/prisma-auth.repository";
import { NONCE_STORE } from "./domain/nonce-store.port";
import { InMemoryNonceStore } from "./infra/in-memory-nonce.store";
import { GenerateNonceUseCase } from "./application/use-cases/generate-nonce.use-case";
import { VerifyAndIssueTokenUseCase } from "./application/use-cases/verify-and-issue-token.use-case";
import { CreateProfileAndIssueTokenUseCase } from "./application/use-cases/create-profile-and-issue-token.use-case";

@Module({
  imports: [ConfigModule],
  providers: [
    AuthService,
    {
      provide: AUTH_REPOSITORY,
      useClass: PrismaAuthRepository,
    },
    {
      provide: NONCE_STORE,
      useClass: InMemoryNonceStore,
    },
    GenerateNonceUseCase,
    VerifyAndIssueTokenUseCase,
    CreateProfileAndIssueTokenUseCase,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

