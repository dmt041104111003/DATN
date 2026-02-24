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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const jwt = require("jsonwebtoken");
const config_service_1 = require("../config/config.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.nonceStore = new Map();
    }
    generateNonce(stakeAddress) {
        const nonce = (0, crypto_1.randomBytes)(32).toString("hex");
        this.nonceStore.set(stakeAddress, nonce);
        return nonce;
    }
    async verifyAndIssueToken(params) {
        const { stakeAddress, nonce, signature, key } = params;
        const expectedNonce = this.nonceStore.get(stakeAddress);
        if (!expectedNonce || expectedNonce !== nonce) {
            throw new common_1.UnauthorizedException("Invalid or expired nonce.");
        }
        this.nonceStore.delete(stakeAddress);
        if (!signature || !key) {
            throw new common_1.UnauthorizedException("Missing signature or public key.");
        }
        const wallet = await this.prisma.wallet.upsert({
            where: { address: stakeAddress },
            update: {
                lastLogin: new Date(),
            },
            create: {
                address: stakeAddress,
                lastLogin: new Date(),
            },
        });
        const profile = await this.prisma.profile.findFirst({
            where: { walletAddress: wallet.address },
            include: { role: true },
        });
        if (!profile) {
            const roles = await this.prisma.role.findMany({
                select: { id: true, code: true },
                orderBy: { id: "asc" },
            });
            return {
                needProfile: true,
                roles,
            };
        }
        const secret = this.config.jwtSecret;
        if (!secret) {
            throw new common_1.UnauthorizedException("JWT_SECRET is not configured.");
        }
        const payload = {
            sub: stakeAddress,
            stakeAddress,
            profileId: profile.id,
            role: profile.role.code,
            displayName: profile.displayName,
            glnCodeRoot: profile.glnCodeRoot,
        };
        const token = jwt.sign(payload, secret, { expiresIn: "7d" });
        return {
            token,
            profile: {
                id: profile.id,
                role: profile.role.code,
                displayName: profile.displayName,
                glnCodeRoot: profile.glnCodeRoot,
            },
        };
    }
    async createProfileAndIssueToken(params) {
        const { stakeAddress, roleId, displayName, glnCodeRoot } = params;
        const wallet = await this.prisma.wallet.upsert({
            where: { address: stakeAddress },
            update: {
                lastLogin: new Date(),
            },
            create: {
                address: stakeAddress,
                lastLogin: new Date(),
            },
        });
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role) {
            throw new common_1.UnauthorizedException("Invalid role.");
        }
        const profile = await this.prisma.profile.upsert({
            where: { walletAddress: wallet.address },
            update: {
                roleId: role.id,
                displayName,
                glnCodeRoot,
            },
            create: {
                walletAddress: wallet.address,
                roleId: role.id,
                displayName,
                glnCodeRoot,
            },
            include: { role: true },
        });
        const secret = this.config.jwtSecret;
        if (!secret) {
            throw new common_1.UnauthorizedException("JWT_SECRET is not configured.");
        }
        const payload = {
            sub: stakeAddress,
            stakeAddress,
            profileId: profile.id,
            role: profile.role.code,
            displayName: profile.displayName,
            glnCodeRoot: profile.glnCodeRoot,
        };
        const token = jwt.sign(payload, secret, { expiresIn: "7d" });
        return {
            token,
            profile: {
                id: profile.id,
                role: profile.role.code,
                displayName: profile.displayName,
                glnCodeRoot: profile.glnCodeRoot,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map