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
exports.PrismaAuthRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PrismaAuthRepository = class PrismaAuthRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertWallet(address, lastLogin) {
        var _a;
        const wallet = await this.prisma.wallet.upsert({
            where: { address },
            update: { lastLogin },
            create: { address, lastLogin },
        });
        return {
            address: wallet.address,
            lastLogin: (_a = wallet.lastLogin) !== null && _a !== void 0 ? _a : new Date(),
        };
    }
    async findProfileByWalletAddress(address) {
        const profile = await this.prisma.profile.findFirst({
            where: { walletAddress: address },
        });
        if (!profile)
            return null;
        return {
            id: profile.id,
            walletAddress: profile.walletAddress,
            roleCode: profile.roleCode,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            location: profile.location,
            coordinates: profile.coordinates,
        };
    }
    async findAllRoles() {
        return [
            { id: 1, code: "ENTERPRISE" },
            { id: 2, code: "TRANSIT" },
            { id: 3, code: "AGENT" },
            { id: 4, code: "SHIPPER" },
        ];
    }
    async upsertProfile(params) {
        const { walletAddress, roleCode, displayName, location, coordinates } = params;
        const profile = await this.prisma.profile.upsert({
            where: { walletAddress },
            update: {
                roleCode,
                displayName,
                location,
                coordinates,
            },
            create: {
                walletAddress,
                roleCode,
                displayName,
                location,
                coordinates,
            },
        });
        return {
            id: profile.id,
            walletAddress: profile.walletAddress,
            roleCode: profile.roleCode,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            location: profile.location,
            coordinates: profile.coordinates,
        };
    }
    async findProfileRoleCodeById(profileId) {
        var _a;
        const profile = await this.prisma.profile.findUnique({
            where: { id: profileId },
            select: { roleCode: true },
        });
        return (_a = profile === null || profile === void 0 ? void 0 : profile.roleCode) !== null && _a !== void 0 ? _a : null;
    }
};
exports.PrismaAuthRepository = PrismaAuthRepository;
exports.PrismaAuthRepository = PrismaAuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaAuthRepository);
//# sourceMappingURL=prisma-auth.repository.js.map