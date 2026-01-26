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
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma.service");
const redis_service_1 = require("../redis/redis.service");
const core_1 = require("@meshsdk/core");
let AuthService = class AuthService {
    prisma;
    jwtService;
    redis;
    constructor(prisma, jwtService, redis) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.redis = redis;
    }
    async getNonce(address) {
        const userAddress = address.trim();
        const nonce = (0, core_1.generateNonce)('I agree to the term and conditions of the HSUPPLY: ');
        const user = await this.prisma.user.upsert({
            where: { address: userAddress },
            update: {},
            create: { address: userAddress },
        });
        await this.prisma.walletNonce.upsert({
            where: { address: userAddress },
            update: { nonce, userId: user.id },
            create: { address: userAddress, nonce, userId: user.id },
        });
        return { nonce };
    }
    async assignEnterpriseRoleIfNone(userId) {
        const existing = await this.prisma.userRole.findMany({
            where: { userId },
            select: { id: true },
        });
        if (existing.length > 0)
            return;
        const enterpriseRole = await this.prisma.role.findUnique({
            where: { code: 'ENTERPRISE' },
            select: { id: true },
        });
        if (!enterpriseRole) {
            return;
        }
        await this.prisma.userRole.create({
            data: {
                userId,
                roleId: enterpriseRole.id,
            },
        });
    }
    async verifyWallet(address, signature, key, walletName) {
        const userAddress = address.trim();
        const walletNonce = await this.prisma.walletNonce.findUnique({
            where: { address: userAddress },
        });
        if (!walletNonce) {
            throw new common_1.UnauthorizedException('Nonce not found. Get nonce first.');
        }
        const isValid = (0, core_1.checkSignature)(walletNonce.nonce, { signature, key }, userAddress);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid signature');
        }
        const user = await this.prisma.user.upsert({
            where: { address: userAddress },
            update: { walletName },
            create: { address: userAddress, walletName },
        });
        await this.assignEnterpriseRoleIfNone(user.id);
        const newNonce = (0, core_1.generateNonce)('I agree to the term and conditions of the HSUPPLY: ');
        await this.prisma.walletNonce.update({
            where: { address: userAddress },
            data: { nonce: newNonce, userId: user.id },
        });
        const token = this.jwtService.sign({
            sub: user.id,
            address: user.address,
        });
        return {
            access_token: token,
            user: {
                id: user.id,
                address: user.address,
                walletName: user.walletName,
            },
        };
    }
    async validateUser(userId) {
        const cacheKey = `user:${userId}`;
        const cached = await this.redis.get(cacheKey);
        if (cached && typeof cached === 'object')
            return cached;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        if (!user)
            return null;
        const roleCode = user.roles && user.roles.length > 0 ? user.roles[0].role.code : null;
        const userData = {
            id: user.id,
            address: user.address,
            walletName: user.walletName,
            role: roleCode,
        };
        await this.redis.set(cacheKey, userData, 600);
        return userData;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        redis_service_1.RedisService])
], AuthService);
//# sourceMappingURL=auth.service.js.map