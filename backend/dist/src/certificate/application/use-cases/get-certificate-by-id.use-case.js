"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCertificateByIdUseCase = void 0;
const common_1 = require("@nestjs/common");
const certificate_repository_1 = require("../../domain/certificate.repository");
let GetCertificateByIdUseCase = class GetCertificateByIdUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, issuerProfileId) {
        const cert = await this.repository.getCertificateById(id, issuerProfileId);
        if (!cert) {
            throw new common_1.NotFoundException("Certificate not found.");
        }
        return cert;
    }
};
exports.GetCertificateByIdUseCase = GetCertificateByIdUseCase;
exports.GetCertificateByIdUseCase = GetCertificateByIdUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(certificate_repository_1.CERTIFICATE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetCertificateByIdUseCase);
//# sourceMappingURL=get-certificate-by-id.use-case.js.map