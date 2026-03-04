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
exports.CertificateController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth/auth.service");
const certificate_service_1 = require("./certificate.service");
const certificate_dto_1 = require("./dto/certificate.dto");
const ENTERPRISE_ROLE = "ENTERPRISE";
let CertificateController = class CertificateController {
    constructor(certificate, auth) {
        this.certificate = certificate;
        this.auth = auth;
    }
    async list(token, search, attachedToBatchId, pageStr, pageSizeStr) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can manage certificates.");
        }
        const page = pageStr ? parseInt(pageStr, 10) : 1;
        const pageSize = pageSizeStr ? parseInt(pageSizeStr, 10) : 20;
        return this.certificate.list(profileId, {
            search: (search === null || search === void 0 ? void 0 : search.trim()) || undefined,
            attachedToBatchId: (attachedToBatchId === null || attachedToBatchId === void 0 ? void 0 : attachedToBatchId.trim()) || undefined,
            page: Number.isFinite(page) ? page : 1,
            pageSize: Number.isFinite(pageSize) ? pageSize : 20,
        });
    }
    async getCertificateIdsByBatch(batchId, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can manage certificates.");
        }
        const ids = await this.certificate.getCertificateIdsByBatchId(batchId.trim(), profileId);
        return { certificateIds: ids };
    }
    async setCertificatesForBatch(batchId, body, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can manage certificates.");
        }
        const certificateIds = Array.isArray(body === null || body === void 0 ? void 0 : body.certificateIds)
            ? body.certificateIds.filter((n) => Number.isFinite(n))
            : [];
        await this.certificate.setCertificatesForBatch(batchId.trim(), profileId, certificateIds);
        return { ok: true };
    }
    async getById(idStr, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can view certificates.");
        }
        const id = parseInt(idStr, 10);
        if (!Number.isFinite(id)) {
            throw new common_1.BadRequestException("Invalid certificate id.");
        }
        return this.certificate.getById(id, profileId);
    }
    async create(body, token) {
        var _a, _b, _c, _d;
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can create certificates.");
        }
        if (!((_a = body.title) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw new common_1.BadRequestException("title is required.");
        }
        if (!((_b = body.imageUrl) === null || _b === void 0 ? void 0 : _b.trim())) {
            throw new common_1.BadRequestException("imageUrl is required (upload image via POST /upload/image first).");
        }
        if (!((_c = body.number) === null || _c === void 0 ? void 0 : _c.trim())) {
            throw new common_1.BadRequestException("Certificate number (No.) is required.");
        }
        if (!((_d = body.authority) === null || _d === void 0 ? void 0 : _d.trim())) {
            throw new common_1.BadRequestException("Certificate authority is required.");
        }
        return this.certificate.create(profileId, {
            title: body.title,
            imageUrl: body.imageUrl,
            number: body.number,
            authority: body.authority,
            expiryDate: body.expiryDate,
            documentType: body.documentType,
            standardReference: body.standardReference,
            scope: body.scope,
            documentUrl: body.documentUrl,
        });
    }
    async update(idStr, body, token) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can update certificates.");
        }
        const id = parseInt(idStr, 10);
        if (!Number.isFinite(id)) {
            throw new common_1.BadRequestException("Invalid certificate id.");
        }
        return this.certificate.update(id, profileId, {
            title: (_a = body.title) === null || _a === void 0 ? void 0 : _a.trim(),
            imageUrl: (_b = body.imageUrl) === null || _b === void 0 ? void 0 : _b.trim(),
            number: (_d = (_c = body.number) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : null,
            authority: (_f = (_e = body.authority) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : null,
            expiryDate: body.expiryDate,
            documentType: (_h = (_g = body.documentType) === null || _g === void 0 ? void 0 : _g.trim()) !== null && _h !== void 0 ? _h : null,
            standardReference: (_k = (_j = body.standardReference) === null || _j === void 0 ? void 0 : _j.trim()) !== null && _k !== void 0 ? _k : null,
            scope: (_m = (_l = body.scope) === null || _l === void 0 ? void 0 : _l.trim()) !== null && _m !== void 0 ? _m : null,
            documentUrl: (_p = (_o = body.documentUrl) === null || _o === void 0 ? void 0 : _o.trim()) !== null && _p !== void 0 ? _p : null,
        });
    }
    async delete(idStr, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can delete certificates.");
        }
        const id = parseInt(idStr, 10);
        if (!Number.isFinite(id)) {
            throw new common_1.BadRequestException("Invalid certificate id.");
        }
        await this.certificate.delete(id, profileId);
        return { ok: true };
    }
};
exports.CertificateController = CertificateController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("token")),
    __param(1, (0, common_1.Query)("search")),
    __param(2, (0, common_1.Query)("attachedToBatchId")),
    __param(3, (0, common_1.Query)("page")),
    __param(4, (0, common_1.Query)("pageSize")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CertificateController.prototype, "list", null);
__decorate([
    (0, common_1.Get)("batch/:batchId/ids"),
    __param(0, (0, common_1.Param)("batchId")),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CertificateController.prototype, "getCertificateIdsByBatch", null);
__decorate([
    (0, common_1.Put)("batch/:batchId"),
    __param(0, (0, common_1.Param)("batchId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], CertificateController.prototype, "setCertificatesForBatch", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CertificateController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [certificate_dto_1.CreateCertificateDto, String]),
    __metadata("design:returntype", Promise)
], CertificateController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, certificate_dto_1.UpdateCertificateDto, String]),
    __metadata("design:returntype", Promise)
], CertificateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CertificateController.prototype, "delete", null);
exports.CertificateController = CertificateController = __decorate([
    (0, common_1.Controller)("certificate"),
    __metadata("design:paramtypes", [certificate_service_1.CertificateService,
        auth_service_1.AuthService])
], CertificateController);
//# sourceMappingURL=certificate.controller.js.map