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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
    async assertEnterprise(userId) {
        const role = await this.getRoleCode(userId);
        if (role !== 'ENTERPRISE')
            throw new common_1.BadRequestException('Enterprise role required');
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async listAgents(enterpriseUserId) {
        await this.assertEnterprise(enterpriseUserId);
        const agents = await this.prisma.userRole.findMany({
            where: { role: { code: 'AGENT' } },
            select: {
                user: {
                    select: {
                        id: true,
                        address: true,
                        walletName: true,
                        displayName: true,
                        location: true,
                        gpsLatitude: true,
                        gpsLongitude: true,
                    },
                },
            },
        });
        return agents.map((r) => r.user);
    }
    async upsertAgent(enterpriseUserId, dto) {
        await this.assertEnterprise(enterpriseUserId);
        const address = dto.walletAddress.trim();
        const agentUser = await this.prisma.user.upsert({
            where: { address },
            update: {},
            create: { address },
        });
        const agentRole = await this.getRoleCode(agentUser.id);
        if (agentRole === 'ENTERPRISE') {
            throw new common_1.BadRequestException('Cannot add enterprise as agent');
        }
        if (!agentRole) {
            const role = await this.prisma.role.findUnique({
                where: { code: 'AGENT' },
                select: { id: true },
            });
            if (!role)
                throw new common_1.BadRequestException('Role not seeded');
            await this.prisma.userRole.create({
                data: { userId: agentUser.id, roleId: role.id },
            });
        }
        return this.prisma.user.update({
            where: { id: agentUser.id },
            data: {
                displayName: dto.displayName,
                location: dto.location,
                gpsLatitude: dto.gpsLatitude,
                gpsLongitude: dto.gpsLongitude,
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.user.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.user.delete({ where: { id } });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map