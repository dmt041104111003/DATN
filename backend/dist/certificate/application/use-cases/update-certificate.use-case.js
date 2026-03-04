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
exports.UpdateCertificateUseCase = void 0;
const common_1 = require("@nestjs/common");
const certificate_repository_1 = require("../../domain/certificate.repository");
let UpdateCertificateUseCase = class UpdateCertificateUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, issuerProfileId, data) {
        if (!Number.isFinite(id)) {
            throw new common_1.BadRequestException("Invalid certificate id.");
        }
        const payload = {};
        if (data.title !== undefined) {
            const title = (data.title || "").trim();
            if (!title) {
                throw new common_1.BadRequestException("title cannot be empty.");
            }
            payload.title = title;
        }
        if (data.imageUrl !== undefined) {
            const v = (data.imageUrl || "").trim();
            payload.imageUrl = v || undefined;
        }
        if (data.number !== undefined) {
            payload.number = data.number != null ? String(data.number).trim() || null : null;
        }
        if (data.authority !== undefined) {
            payload.authority = data.authority != null ? String(data.authority).trim() || null : null;
        }
        if (data.expiryDate !== undefined) {
            if (data.expiryDate == null) {
                payload.expiryDate = null;
            }
            else {
                const d = data.expiryDate instanceof Date
                    ? data.expiryDate
                    : new Date(String(data.expiryDate));
                if (Number.isNaN(d.getTime())) {
                    throw new common_1.BadRequestException("expiryDate is invalid.");
                }
                payload.expiryDate = d;
            }
        }
        if (data.documentType !== undefined) {
            payload.documentType = data.documentType != null ? String(data.documentType).trim() || null : null;
        }
        if (data.standardReference !== undefined) {
            payload.standardReference = data.standardReference != null ? String(data.standardReference).trim() || null : null;
        }
        if (data.scope !== undefined) {
            payload.scope = data.scope != null ? String(data.scope).trim() || null : null;
        }
        if (data.documentUrl !== undefined) {
            payload.documentUrl = data.documentUrl != null ? String(data.documentUrl).trim() || null : null;
        }
        return this.repository.updateCertificate(id, issuerProfileId, payload);
    }
};
exports.UpdateCertificateUseCase = UpdateCertificateUseCase;
exports.UpdateCertificateUseCase = UpdateCertificateUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(certificate_repository_1.CERTIFICATE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UpdateCertificateUseCase);
//# sourceMappingURL=update-certificate.use-case.js.map