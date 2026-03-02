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
exports.CertificateService = void 0;
const common_1 = require("@nestjs/common");
const certificate_repository_1 = require("./domain/certificate.repository");
const list_certificates_use_case_1 = require("./application/use-cases/list-certificates.use-case");
const get_certificate_by_id_use_case_1 = require("./application/use-cases/get-certificate-by-id.use-case");
const create_certificate_use_case_1 = require("./application/use-cases/create-certificate.use-case");
let CertificateService = class CertificateService {
    constructor(repository, listCertificatesUseCase, getCertificateByIdUseCase, createCertificateUseCase) {
        this.repository = repository;
        this.listCertificatesUseCase = listCertificatesUseCase;
        this.getCertificateByIdUseCase = getCertificateByIdUseCase;
        this.createCertificateUseCase = createCertificateUseCase;
    }
    async list(issuerProfileId, options) {
        return this.listCertificatesUseCase.execute(issuerProfileId, options);
    }
    async getById(id, issuerProfileId) {
        return this.getCertificateByIdUseCase.execute(id, issuerProfileId);
    }
    async create(issuerProfileId, data) {
        return this.createCertificateUseCase.execute(issuerProfileId, data);
    }
};
exports.CertificateService = CertificateService;
exports.CertificateService = CertificateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(certificate_repository_1.CERTIFICATE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, list_certificates_use_case_1.ListCertificatesUseCase,
        get_certificate_by_id_use_case_1.GetCertificateByIdUseCase,
        create_certificate_use_case_1.CreateCertificateUseCase])
], CertificateService);
//# sourceMappingURL=certificate.service.js.map