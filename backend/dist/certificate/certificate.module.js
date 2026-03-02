"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const prisma_module_1 = require("../prisma/prisma.module");
const certificate_controller_1 = require("./certificate.controller");
const certificate_service_1 = require("./certificate.service");
const certificate_repository_1 = require("./domain/certificate.repository");
const prisma_certificate_repository_1 = require("./infra/prisma-certificate.repository");
const list_certificates_use_case_1 = require("./application/use-cases/list-certificates.use-case");
const get_certificate_by_id_use_case_1 = require("./application/use-cases/get-certificate-by-id.use-case");
const create_certificate_use_case_1 = require("./application/use-cases/create-certificate.use-case");
let CertificateModule = class CertificateModule {
};
exports.CertificateModule = CertificateModule;
exports.CertificateModule = CertificateModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule],
        providers: [
            certificate_service_1.CertificateService,
            {
                provide: certificate_repository_1.CERTIFICATE_REPOSITORY,
                useClass: prisma_certificate_repository_1.PrismaCertificateRepository,
            },
            list_certificates_use_case_1.ListCertificatesUseCase,
            get_certificate_by_id_use_case_1.GetCertificateByIdUseCase,
            create_certificate_use_case_1.CreateCertificateUseCase,
        ],
        controllers: [certificate_controller_1.CertificateController],
    })
], CertificateModule);
//# sourceMappingURL=certificate.module.js.map