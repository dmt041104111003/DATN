import { Module } from "@nestjs/common";
import { ConfigModule } from "../core/config/config.module";
import { AuthModule } from "../auth/auth.module";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";
import { IMAGE_STORAGE } from "./domain/image-storage.port";
import { CloudinaryImageStorage } from "./infra/cloudinary-image.storage";
import { UploadImageUseCase } from "./application/use-cases/upload-image.use-case";

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [
    UploadService,
    {
      provide: IMAGE_STORAGE,
      useClass: CloudinaryImageStorage,
    },
    UploadImageUseCase,
  ],
  controllers: [UploadController],
  exports: [UploadService],
})
export class UploadModule {}
