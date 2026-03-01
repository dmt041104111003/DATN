import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { CertificateController } from "./certificate.controller";
import { CertificateService } from "./certificate.service";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [CertificateService],
  controllers: [CertificateController],
})
export class CertificateModule {}
