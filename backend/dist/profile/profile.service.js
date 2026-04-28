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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const jwt = __importStar(require("jsonwebtoken"));
let ProfileService = class ProfileService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.userSelect = {
            id: true,
            address: true,
            roleCode: true,
            displayName: true,
            phoneNumber: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        };
    }
    mapProfileRow(account) {
        if (!account)
            return null;
        return {
            id: account.id,
            walletAddress: account.address,
            roleCode: account.roleCode,
            displayName: account.displayName,
            phoneNumber: account.phoneNumber,
            isActive: account.isActive,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        };
    }
    getAddress(value) {
        return (value || '').trim();
    }
    getSecret() {
        const secret = this.config.get('JWT_SECRET');
        if (!secret)
            throw new common_1.UnauthorizedException('JWT secret not configured');
        return secret;
    }
    validatePaymentAddress(custodianAddress) {
        const addr = this.getAddress(custodianAddress);
        const isPayment = /^addr1[0-9a-z]+$/.test(addr) || /^addr_test1[0-9a-z]+$/.test(addr);
        if (!isPayment) {
            throw new common_1.BadRequestException(`Invalid wallet address. Please use a payment address (addr... / addr_test...). Received: ${custodianAddress}`);
        }
        return addr;
    }
    async createProfile(custodianAddress, data) {
        const addr = this.validatePaymentAddress(custodianAddress);
        const roleCode = (data.roleCode || '').trim().toUpperCase();
        if (!roleCode)
            throw new common_1.BadRequestException('Role is required.');
        const role = await this.prisma.role.findUnique({ where: { code: roleCode } });
        if (!role)
            throw new common_1.BadRequestException('Invalid role.');
        const displayName = (data.displayName || '').trim();
        if (!displayName)
            throw new common_1.BadRequestException('Display name is required.');
        const phoneNumber = (data.phoneNumber || '').trim() || null;
        const existing = await this.prisma.user.findUnique({
            where: { address: addr },
            select: { roleCode: true },
        });
        if (existing?.roleCode && existing.roleCode !== roleCode) {
            throw new common_1.BadRequestException('Role cannot be changed after profile creation.');
        }
        const account = await this.prisma.user.update({
            where: { address: addr },
            data: {
                roleCode: existing?.roleCode || roleCode,
                displayName,
                phoneNumber,
                isActive: true,
            },
            select: this.userSelect,
        });
        return {
            token: jwt.sign({
                sub: addr,
                stakeAddress: addr,
                profileId: account.id,
                role: account.roleCode,
                displayName: account.displayName,
                phoneNumber: account.phoneNumber,
            }, this.getSecret(), { expiresIn: '7d' }),
            profile: this.mapProfileRow(account),
        };
    }
    async updateProfile(accountId, data) {
        const displayName = typeof data.displayName === 'string' ? data.displayName.trim() : '';
        const phoneNumber = typeof data.phoneNumber === 'string' ? data.phoneNumber.trim() || null : undefined;
        if (!displayName) {
            throw new common_1.BadRequestException('Display name is required.');
        }
        const account = await this.prisma.user.update({
            where: { id: accountId },
            data: {
                displayName,
                ...(phoneNumber !== undefined ? { phoneNumber } : {}),
            },
            select: this.userSelect,
        });
        return this.mapProfileRow(account);
    }
    async listProfiles(custodianAddress) {
        const addr = this.getAddress(custodianAddress);
        if (!addr) {
            throw new common_1.BadRequestException('Account reference is required.');
        }
        const account = await this.prisma.user.findUnique({
            where: { address: addr },
            select: this.userSelect,
        });
        if (!account || !account.roleCode)
            return [];
        return [this.mapProfileRow(account)];
    }
    async getProfileById(accountId) {
        const account = await this.prisma.user.findUnique({
            where: { id: accountId },
            select: this.userSelect,
        });
        if (!account || !account.roleCode) {
            throw new common_1.BadRequestException('Profile not found.');
        }
        return this.mapProfileRow(account);
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map