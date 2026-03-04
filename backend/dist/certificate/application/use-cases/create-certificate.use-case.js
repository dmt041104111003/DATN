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
exports.CreateCertificateUseCase = void 0;
const common_1 = require("@nestjs/common");
const certificate_repository_1 = require("../../domain/certificate.repository");
let CreateCertificateUseCase = class CreateCertificateUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(issuerProfileId, data) {
        const title = (data.title || "").trim();
        const batchId = (data.batchId || "").trim();
        const imageUrl = (data.imageUrl || "").trim();
        const number = (data.number || "").trim();
        const authority = (data.authority || "").trim();
        const expiryRaw = data.expiryDate;
        if (!title || !batchId) {
            throw new common_1.BadRequestException("title and batchId are required.");
        }
        if (!imageUrl) {
            throw new common_1.BadRequestException("imageUrl is required (upload image via POST /upload/image first).");
        }
        if (!number) {
            throw new common_1.BadRequestException("Certificate number (No.) is required.");
        }
        if (!authority) {
            throw new common_1.BadRequestException("Certificate authority is required.");
        }
        let expiryDate;
        if (expiryRaw != null) {
            const d = expiryRaw instanceof Date ? expiryRaw : new Date(String(expiryRaw));
            if (Number.isNaN(d.getTime())) {
                throw new common_1.BadRequestException("expiryDate is invalid.");
            }
            expiryDate = d;
        }
        const batchExists = await this.repository.batchExistsForIssuer(batchId, issuerProfileId);
        if (!batchExists) {
            throw new common_1.BadRequestException("Batch not found or you are not the minter.");
        }
        return this.repository.createCertificate(issuerProfileId, {
            title,
            batchId,
            imageUrl,
            number,
            authority,
            expiryDate,
            metadata: data.metadata,
        });
    }
};
exports.CreateCertificateUseCase = CreateCertificateUseCase;
exports.CreateCertificateUseCase = CreateCertificateUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(certificate_repository_1.CERTIFICATE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], CreateCertificateUseCase);
//# sourceMappingURL=create-certificate.use-case.js.map