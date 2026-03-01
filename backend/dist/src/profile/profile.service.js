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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const config_service_1 = require("../config/config.service");
const prisma_service_1 = require("../prisma/prisma.service");
const auth_service_1 = require("../auth/auth.service");
const upload_service_1 = require("../upload/upload.service");
let ProfileService = class ProfileService {
    constructor(config, prisma, auth, upload) {
        this.config = config;
        this.prisma = prisma;
        this.auth = auth;
        this.upload = upload;
    }
    async listProfilesFromToken(token) {
        await this.auth.getProfileIdFromToken(token);
        const profiles = await this.prisma.profile.findMany({
            select: {
                walletAddress: true,
                displayName: true,
                location: true,
                coordinates: true,
                role: { select: { code: true } },
            },
            orderBy: { displayName: "asc" },
        });
        return profiles.map((p) => {
            var _a, _b, _c, _d;
            return ({
                walletAddress: p.walletAddress,
                displayName: p.displayName,
                location: (_a = p.location) !== null && _a !== void 0 ? _a : null,
                coordinates: (_b = p.coordinates) !== null && _b !== void 0 ? _b : null,
                role: (_d = (_c = p.role) === null || _c === void 0 ? void 0 : _c.code) !== null && _d !== void 0 ? _d : null,
            });
        });
    }
    async listProfilesByRoleCode(roleCode) {
        const code = (roleCode || "").trim().toUpperCase();
        if (!code)
            return [];
        const role = await this.prisma.role.findUnique({ where: { code } });
        if (!role)
            return [];
        const profiles = await this.prisma.profile.findMany({
            where: { roleId: role.id },
            select: { id: true, displayName: true, walletAddress: true },
            orderBy: { displayName: "asc" },
        });
        return profiles.map((p) => {
            var _a;
            return ({
                id: p.id,
                displayName: (_a = p.displayName) !== null && _a !== void 0 ? _a : "",
                walletAddress: p.walletAddress,
            });
        });
    }
    async updateProfileFromToken(params) {
        var _a, _b;
        const { token, displayName, location, coordinates } = params;
        const secret = this.config.jwtSecret;
        if (!secret) {
            throw new common_1.UnauthorizedException("JWT_SECRET is not configured.");
        }
        let payload;
        try {
            payload = jwt.verify(token, secret);
        }
        catch (_c) {
            throw new common_1.UnauthorizedException("Invalid token.");
        }
        if (!payload ||
            typeof payload !== "object" ||
            typeof payload.profileId !== "number") {
            throw new common_1.UnauthorizedException("Invalid token payload.");
        }
        const profileId = payload.profileId;
        const profile = await this.prisma.profile.update({
            where: { id: profileId },
            data: Object.assign(Object.assign({ displayName }, (location !== undefined && { location: location || null })), (coordinates !== undefined && { coordinates: coordinates || null })),
            include: { role: true, wallet: true },
        });
        const nextPayload = {
            sub: profile.walletAddress,
            stakeAddress: profile.walletAddress,
            profileId: profile.id,
            role: profile.role.code,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            location: profile.location,
            coordinates: profile.coordinates,
        };
        const nextToken = jwt.sign(nextPayload, secret, { expiresIn: "7d" });
        return {
            token: nextToken,
            profile: {
                id: profile.id,
                role: profile.role.code,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
                location: (_a = profile.location) !== null && _a !== void 0 ? _a : null,
                coordinates: (_b = profile.coordinates) !== null && _b !== void 0 ? _b : null,
            },
        };
    }
    async uploadProfileAvatarFromToken(params) {
        var _a, _b;
        const { token, imageDataUrl } = params;
        const secret = this.config.jwtSecret;
        if (!secret) {
            throw new common_1.UnauthorizedException("JWT_SECRET is not configured.");
        }
        let payload;
        try {
            payload = jwt.verify(token, secret);
        }
        catch (_c) {
            throw new common_1.UnauthorizedException("Invalid token.");
        }
        if (!payload ||
            typeof payload !== "object" ||
            typeof payload.profileId !== "number") {
            throw new common_1.UnauthorizedException("Invalid token payload.");
        }
        const profileId = payload.profileId;
        const avatarUrl = await this.upload.uploadImage(imageDataUrl, "profiles");
        const profile = await this.prisma.profile.update({
            where: { id: profileId },
            data: {
                avatarUrl,
            },
            include: { role: true, wallet: true },
        });
        const nextPayload = {
            sub: profile.walletAddress,
            stakeAddress: profile.walletAddress,
            profileId: profile.id,
            role: profile.role.code,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            location: profile.location,
            coordinates: profile.coordinates,
        };
        const nextToken = jwt.sign(nextPayload, secret, { expiresIn: "7d" });
        return {
            token: nextToken,
            profile: {
                id: profile.id,
                role: profile.role.code,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
                location: (_a = profile.location) !== null && _a !== void 0 ? _a : null,
                coordinates: (_b = profile.coordinates) !== null && _b !== void 0 ? _b : null,
            },
        };
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        prisma_service_1.PrismaService,
        auth_service_1.AuthService,
        upload_service_1.UploadService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map