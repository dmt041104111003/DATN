import { Module } from "@nestjs/common";
import { ConfigModule } from "../config/config.module";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { UploadModule } from "../upload/upload.module";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, UploadModule],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
