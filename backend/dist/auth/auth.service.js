"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const jwt = __importStar(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const blockfrost_js_1 = require("@blockfrost/blockfrost-js");
const CSL = __importStar(require("@emurgo/cardano-serialization-lib-nodejs"));
const core_1 = require("@meshsdk/core");
let AuthService = class AuthService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        const projectId = this.config.get('BLOCKFROST_API_KEY') || process.env.BLOCKFROST_API_KEY || '';
        if (!projectId) {
            this.blockfrost = null;
        }
        else {
            this.blockfrost = new blockfrost_js_1.BlockFrostAPI({
                projectId,
                network: this.config.get('APP_NETWORK') === 'mainnet' ? 'mainnet' : 'preprod',
            });
        }
    }
    async getRoles() {
        const roles = await this.prisma.role.findMany({
            orderBy: { code: 'asc' },
            select: { code: true, name: true },
        });
        return (Array.isArray(roles) ? roles : []).map((r, idx) => ({
            id: idx + 1,
            code: r.code,
            name: r.name ?? null,
        }));
    }
    async generateNonce(stakeAddress) {
        const input = this.normalizeStakeAddress(stakeAddress);
        if (!this.isSupportedAddress(input)) {
            throw new common_1.BadRequestException(`Invalid address format. Please provide a payment address (addr... / addr_test...) or a stake address (stake... / stake_test...). Received: ${stakeAddress}`);
        }
        const nonce = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.walletNonce.upsert({
            where: { address: input },
            create: {
                address: input,
                nonce,
                expiresAt,
                usedAt: null,
            },
            update: {
                nonce,
                expiresAt,
                usedAt: null,
            },
        });
        return nonce;
    }
    async verifyAndIssueToken(data) {
        const input = this.normalizeStakeAddress(data.stakeAddress);
        if (!this.isSupportedAddress(input)) {
            throw new common_1.BadRequestException(`Invalid address format. Please provide a payment address (addr... / addr_test...) or a stake address (stake... / stake_test...). Received: ${data.stakeAddress}`);
        }
        const stored = await this.prisma.walletNonce.findUnique({
            where: { address: input },
            select: { nonce: true, expiresAt: true, usedAt: true },
        });
        const expMs = stored?.expiresAt ? new Date(stored.expiresAt).getTime() : 0;
        if (!stored || stored.usedAt || String(stored.nonce || '') !== String(data.nonce || '') || expMs < Date.now()) {
            throw new common_1.UnauthorizedException('Invalid or expired nonce.');
        }
        if (!data.signature || !data.key) {
            throw new common_1.UnauthorizedException('Missing signature or public key.');
        }
        const signatureValid = this.verifyWalletSignature(String(stored.nonce || ''), data.signature, data.key);
        if (!signatureValid) {
            throw new common_1.UnauthorizedException('Invalid wallet signature.');
        }
        await this.prisma.walletNonce.update({
            where: { address: input },
            data: { usedAt: new Date() },
        });
        const paymentAddr = await this.resolvePaymentAddress(input);
        if (!this.isPaymentAddress(paymentAddr)) {
            throw new common_1.BadRequestException(`Could not resolve to a payment address. Please provide a payment address (addr... / addr_test...), or configure BLOCKFROST_API_KEY to resolve stake -> payment. Received: ${data.stakeAddress}`);
        }
        await this.prisma.user.upsert({
            where: { address: paymentAddr },
            update: { lastLogin: new Date() },
            create: {
                address: paymentAddr,
                lastLogin: new Date(),
            },
        });
        const account = await this.prisma.user.findUnique({
            where: { address: paymentAddr },
            select: {
                id: true,
                address: true,
                roleCode: true,
                displayName: true,
                phoneNumber: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        const secret = this.config.get('JWT_SECRET');
        if (!secret) {
            throw new common_1.UnauthorizedException('JWT secret not configured');
        }
        if (!account?.roleCode) {
            const setupPayload = {
                sub: paymentAddr,
                stakeAddress: input,
                paymentAddress: paymentAddr,
            };
            const setupToken = jwt.sign(setupPayload, secret, { expiresIn: '7d' });
            return {
                needProfile: true,
                roles: await this.getRoles(),
                token: setupToken,
            };
        }
        const payload = {
            sub: paymentAddr,
            stakeAddress: input,
            paymentAddress: paymentAddr,
            profileId: account.id,
            role: account.roleCode,
            displayName: account.displayName,
            phoneNumber: account.phoneNumber,
            walletAddress: account.address,
            isActive: account.isActive,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        };
        const token = jwt.sign(payload, secret, { expiresIn: '7d' });
        return {
            token,
            profile: {
                id: account.id,
                walletAddress: account.address,
                roleCode: account.roleCode,
                displayName: account.displayName,
                phoneNumber: account.phoneNumber,
                isActive: account.isActive,
                createdAt: account.createdAt,
                updatedAt: account.updatedAt,
            },
        };
    }
    normalizeStakeAddress(address) {
        const raw = (address || '').trim();
        if (!raw)
            return raw;
        if (/^(0x)?[0-9a-fA-F]+$/.test(raw) && raw.length > 60) {
            try {
                const hex = raw.startsWith('0x') ? raw.slice(2) : raw;
                const bytes = Buffer.from(hex, 'hex');
                return CSL.Address.from_bytes(bytes).to_bech32();
            }
            catch {
                return raw;
            }
        }
        return raw;
    }
    isStakeAddress(address) {
        return /^stake1[0-9a-z]+$/.test(address) || /^stake_test1[0-9a-z]+$/.test(address);
    }
    isSupportedAddress(address) {
        return this.isPaymentAddress(address) || this.isStakeAddress(address);
    }
    isPaymentAddress(address) {
        if (!address)
            return false;
        if (this.isStakeAddress(address))
            return false;
        return (/^addr1[0-9a-z]+$/.test(address) ||
            /^addr_test1[0-9a-z]+$/.test(address));
    }
    async resolvePaymentAddress(input) {
        const addr = input;
        if (this.isPaymentAddress(addr))
            return addr;
        if (this.isStakeAddress(addr)) {
            if (!this.blockfrost) {
                throw new common_1.BadRequestException('Cannot resolve stake address to payment address: BLOCKFROST_API_KEY is not configured on backend.');
            }
            const addresses = await this.blockfrost.accountsAddresses(addr);
            const first = addresses?.[0]?.address;
            if (!first) {
                throw new common_1.BadRequestException('No payment addresses found for this stake address.');
            }
            return first;
        }
        return addr;
    }
    verifyWalletSignature(nonce, signature, key) {
        try {
            if ((0, core_1.checkSignature)(nonce, { signature, key }))
                return true;
            const nonceHex = Buffer.from(nonce, 'utf8').toString('hex');
            if ((0, core_1.checkSignature)(nonceHex, { signature, key }))
                return true;
            return false;
        }
        catch {
            return false;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map