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
    async list(token, batchId, search, pageStr, pageSizeStr) {
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
            batchId: (batchId === null || batchId === void 0 ? void 0 : batchId.trim()) || undefined,
            search: (search === null || search === void 0 ? void 0 : search.trim()) || undefined,
            page: Number.isFinite(page) ? page : 1,
            pageSize: Number.isFinite(pageSize) ? pageSize : 20,
        });
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
        var _a, _b, _c;
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can create certificates.");
        }
        if (!((_a = body.title) === null || _a === void 0 ? void 0 : _a.trim()) || !((_b = body.batchId) === null || _b === void 0 ? void 0 : _b.trim())) {
            throw new common_1.BadRequestException("title and batchId are required.");
        }
        if (!((_c = body.imageUrl) === null || _c === void 0 ? void 0 : _c.trim())) {
            throw new common_1.BadRequestException("imageUrl is required (upload image via POST /upload/image first).");
        }
        return this.certificate.create(profileId, {
            title: body.title,
            batchId: body.batchId,
            imageUrl: body.imageUrl,
            metadata: body.metadata,
        });
    }
};
exports.CertificateController = CertificateController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("token")),
    __param(1, (0, common_1.Query)("batchId")),
    __param(2, (0, common_1.Query)("search")),
    __param(3, (0, common_1.Query)("page")),
    __param(4, (0, common_1.Query)("pageSize")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CertificateController.prototype, "list", null);
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
exports.CertificateController = CertificateController = __decorate([
    (0, common_1.Controller)("certificate"),
    __metadata("design:paramtypes", [certificate_service_1.CertificateService,
        auth_service_1.AuthService])
], CertificateController);
//# sourceMappingURL=certificate.controller.js.map