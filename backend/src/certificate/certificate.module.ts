import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { CertificateController } from "./certificate.controller";
import { CertificateService } from "./certificate.service";
import { CERTIFICATE_REPOSITORY } from "./domain/certificate.repository";
import { PrismaCertificateRepository } from "./infra/prisma-certificate.repository";
import { ListCertificatesUseCase } from "./application/use-cases/list-certificates.use-case";
import { GetCertificateByIdUseCase } from "./application/use-cases/get-certificate-by-id.use-case";
import { CreateCertificateUseCase } from "./application/use-cases/create-certificate.use-case";
import { UpdateCertificateUseCase } from "./application/use-cases/update-certificate.use-case";
import { DeleteCertificateUseCase } from "./application/use-cases/delete-certificate.use-case";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    CertificateService,
    {
      provide: CERTIFICATE_REPOSITORY,
      useClass: PrismaCertificateRepository,
    },
    ListCertificatesUseCase,
    GetCertificateByIdUseCase,
    CreateCertificateUseCase,
    UpdateCertificateUseCase,
    DeleteCertificateUseCase,
  ],
  controllers: [CertificateController],
})
export class CertificateModule {}
