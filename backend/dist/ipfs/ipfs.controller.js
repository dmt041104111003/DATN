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
exports.IpfsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const auth_service_1 = require("../auth/auth.service");
const ipfs_service_1 = require("./ipfs.service");
const ENTERPRISE_ROLE = "ENTERPRISE";
let IpfsController = class IpfsController {
    constructor(ipfs, auth) {
        this.ipfs = ipfs;
        this.auth = auth;
    }
    async upload(file, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can upload to IPFS.");
        }
        if (!file || !file.buffer || file.buffer.length === 0) {
            throw new common_1.BadRequestException("No file uploaded. Send multipart/form-data with 'file' field.");
        }
        const { ipfsHash } = await this.ipfs.uploadFile({
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
        });
        return { ipfsHash };
    }
    getGatewayUrl(hash) {
        const clean = (hash || "").trim().replace(/^ipfs:\/\//, "");
        if (!clean) {
            return { url: "" };
        }
        const url = this.ipfs.getGatewayUrl(clean);
        return { url };
    }
};
exports.IpfsController = IpfsController;
__decorate([
    (0, common_1.Post)("upload"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file", { limits: { fileSize: 10 * 1024 * 1024 } })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IpfsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)("gateway-url/:hash"),
    __param(0, (0, common_1.Param)("hash")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], IpfsController.prototype, "getGatewayUrl", null);
exports.IpfsController = IpfsController = __decorate([
    (0, common_1.Controller)("ipfs"),
    __metadata("design:paramtypes", [ipfs_service_1.IpfsService,
        auth_service_1.AuthService])
], IpfsController);
//# sourceMappingURL=ipfs.controller.js.map