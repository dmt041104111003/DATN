import { Module } from "@nestjs/common";
import { ConfigModule } from "../core/config/config.module";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { UploadModule } from "../upload/upload.module";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { PROFILE_REPOSITORY } from "./domain/profile.repository";
import { PrismaProfileRepository } from "./infra/prisma-profile.repository";
import { AVATAR_STORAGE } from "./domain/avatar-storage.port";
import { UploadAvatarStorage } from "./infra/upload-avatar.storage";
import { ListProfilesUseCase } from "./application/use-cases/list-profiles.use-case";
import { ListProfilesByRoleUseCase } from "./application/use-cases/list-profiles-by-role.use-case";
import { UpdateProfileUseCase } from "./application/use-cases/update-profile.use-case";
import { UploadProfileAvatarUseCase } from "./application/use-cases/upload-profile-avatar.use-case";

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, UploadModule],
  providers: [
    ProfileService,
    {
      provide: PROFILE_REPOSITORY,
      useClass: PrismaProfileRepository,
    },
    {
      provide: AVATAR_STORAGE,
      useClass: UploadAvatarStorage,
    },
    ListProfilesUseCase,
    ListProfilesByRoleUseCase,
    UpdateProfileUseCase,
    UploadProfileAvatarUseCase,
  ],
  controllers: [ProfileController],
})
export class ProfileModule {}
