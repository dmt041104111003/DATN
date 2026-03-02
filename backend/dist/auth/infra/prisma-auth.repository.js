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
            include: { role: true },
        });
        if (!profile || !profile.role)
            return null;
        return {
            id: profile.id,
            walletAddress: profile.walletAddress,
            role: {
                id: profile.role.id,
                code: profile.role.code,
            },
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            location: profile.location,
            coordinates: profile.coordinates,
        };
    }
    async findAllRoles() {
        const roles = await this.prisma.role.findMany({
            select: { id: true, code: true },
            orderBy: { id: "asc" },
        });
        return roles;
    }
    async findRoleById(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
        });
        if (!role)
            return null;
        return { id: role.id, code: role.code };
    }
    async upsertProfile(params) {
        const { walletAddress, roleId, displayName, location, coordinates } = params;
        const profile = await this.prisma.profile.upsert({
            where: { walletAddress },
            update: {
                roleId,
                displayName,
                location,
                coordinates,
            },
            create: {
                walletAddress,
                roleId,
                displayName,
                location,
                coordinates,
            },
            include: { role: true },
        });
        return {
            id: profile.id,
            walletAddress: profile.walletAddress,
            role: {
                id: profile.role.id,
                code: profile.role.code,
            },
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            location: profile.location,
            coordinates: profile.coordinates,
        };
    }
    async findProfileRoleCodeById(profileId) {
        var _a, _b;
        const profile = await this.prisma.profile.findUnique({
            where: { id: profileId },
            select: { role: { select: { code: true } } },
        });
        return (_b = (_a = profile === null || profile === void 0 ? void 0 : profile.role) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : null;
    }
};
exports.PrismaAuthRepository = PrismaAuthRepository;
exports.PrismaAuthRepository = PrismaAuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaAuthRepository);
//# sourceMappingURL=prisma-auth.repository.js.map