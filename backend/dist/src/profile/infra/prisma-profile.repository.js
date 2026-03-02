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
exports.PrismaProfileRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PrismaProfileRepository = class PrismaProfileRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listAllProfiles() {
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
    async findRoleByCode(code) {
        const role = await this.prisma.role.findUnique({
            where: { code },
        });
        if (!role)
            return null;
        return { id: role.id, code: role.code };
    }
    async listProfilesByRoleId(roleId) {
        const profiles = await this.prisma.profile.findMany({
            where: { roleId },
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
    async updateProfileById(id, data) {
        var _a, _b, _c;
        const profile = await this.prisma.profile.update({
            where: { id },
            data: Object.assign(Object.assign({ displayName: data.displayName }, (data.location !== undefined && {
                location: data.location || null,
            })), (data.coordinates !== undefined && {
                coordinates: data.coordinates || null,
            })),
            include: { role: true, wallet: true },
        });
        return {
            id: profile.id,
            displayName: profile.displayName,
            walletAddress: profile.walletAddress,
            avatarUrl: (_a = profile.avatarUrl) !== null && _a !== void 0 ? _a : null,
            location: (_b = profile.location) !== null && _b !== void 0 ? _b : null,
            coordinates: (_c = profile.coordinates) !== null && _c !== void 0 ? _c : null,
            roleCode: profile.role.code,
        };
    }
    async updateProfileAvatarById(id, avatarUrl) {
        var _a, _b, _c;
        const profile = await this.prisma.profile.update({
            where: { id },
            data: {
                avatarUrl,
            },
            include: { role: true, wallet: true },
        });
        return {
            id: profile.id,
            displayName: profile.displayName,
            walletAddress: profile.walletAddress,
            avatarUrl: (_a = profile.avatarUrl) !== null && _a !== void 0 ? _a : null,
            location: (_b = profile.location) !== null && _b !== void 0 ? _b : null,
            coordinates: (_c = profile.coordinates) !== null && _c !== void 0 ? _c : null,
            roleCode: profile.role.code,
        };
    }
};
exports.PrismaProfileRepository = PrismaProfileRepository;
exports.PrismaProfileRepository = PrismaProfileRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaProfileRepository);
//# sourceMappingURL=prisma-profile.repository.js.map