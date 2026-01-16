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
const crypto_1 = require("crypto");
const core_1 = require("@meshsdk/core");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async getNonce(address) {
        const nonce = (0, crypto_1.randomBytes)(32).toString('hex');
        await this.prisma.walletNonce.upsert({
            where: { address },
            update: { nonce },
            create: { address, nonce },
        });
        return { nonce };
    }
    async verifyWallet(address, signature, key) {
        const walletNonce = await this.prisma.walletNonce.findUnique({
            where: { address },
        });
        if (!walletNonce) {
            throw new common_1.UnauthorizedException('Nonce not found. Get nonce first.');
        }
        const isValid = await this.verifySignature(walletNonce.nonce, signature, key, address);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid signature');
        }
        let user = await this.prisma.user.findUnique({ where: { address } });
        if (!user) {
            user = await this.prisma.user.create({ data: { address } });
        }
        await this.prisma.walletNonce.delete({ where: { address } });
        const token = this.jwtService.sign({
            sub: user.id,
            address: user.address,
        });
        return {
            access_token: token,
            user: {
                id: user.id,
                address: user.address,
            },
        };
    }
    async verifySignature(nonce, signature, key, address) {
        try {
            return await (0, core_1.checkSignature)(nonce, { signature, key }, address);
        }
        catch (error) {
            console.error('Signature verification failed:', error);
            return false;
        }
    }
    async validateUser(userId) {
        return this.prisma.user.findUnique({ where: { id: userId } });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map