import { Module } from "@nestjs/common";
import { ConfigModule } from "../config/config.module";
import { AuthModule } from "../auth/auth.module";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [UploadService],
  controllers: [UploadController],
  exports: [UploadService],
})
export class UploadModule {}
