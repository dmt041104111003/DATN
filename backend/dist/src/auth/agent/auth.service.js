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
exports.AgentAuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma.service");
const core_1 = require("@meshsdk/core");
let AgentAuthService = class AgentAuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async getNonce(address) {
        const userAddress = address.trim();
        const user = await this.prisma.user.findUnique({
            where: { address: userAddress },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Agent not registered');
        }
        const nonce = (0, core_1.generateNonce)('I agree to the term and conditions of the HSUPPLY: ');
        await this.prisma.walletNonce.upsert({
            where: { address: userAddress },
            update: { nonce, userId: user.id },
            create: { address: userAddress, nonce, userId: user.id },
        });
        return { nonce };
    }
    async getRoleCode(userId) {
        const roles = await this.prisma.userRole.findMany({
            where: { userId },
            select: { role: { select: { code: true } } },
        });
        if (!roles || roles.length === 0)
            return null;
        return roles[0].role.code;
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
        const user = await this.prisma.user.findUnique({
            where: { address: userAddress },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Agent not registered');
        }
        const roleCode = await this.getRoleCode(user.id);
        if (roleCode !== 'AGENT') {
            throw new common_1.UnauthorizedException('Agent role required');
        }
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
};
exports.AgentAuthService = AgentAuthService;
exports.AgentAuthService = AgentAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AgentAuthService);
//# sourceMappingURL=auth.service.js.map