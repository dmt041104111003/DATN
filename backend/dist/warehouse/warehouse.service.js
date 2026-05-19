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
exports.WarehouseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function cleanString(v) {
    return String(v ?? '').trim();
}
let WarehouseService = class WarehouseService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(createdBy) {
        const custodian = cleanString(createdBy);
        return await this.prisma.warehouse.findMany({
            where: { registeringCustodianAddress: custodian },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(createdBy, data) {
        const custodian = cleanString(createdBy);
        return await this.prisma.warehouse.create({
            data: {
                name: cleanString(data?.name),
                location: cleanString(data?.location),
                capacity: cleanString(data?.capacity),
                registeringCustodianAddress: custodian,
            },
        });
    }
    async update(createdBy, idRaw, data) {
        const custodian = cleanString(createdBy);
        const id = cleanString(idRaw);
        const existing = await this.prisma.warehouse.findFirst({
            where: { id, registeringCustodianAddress: custodian },
            select: { id: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Không tìm thấy kho.');
        return await this.prisma.warehouse.update({
            where: { id },
            data: {
                name: data?.name !== undefined ? cleanString(data?.name) : undefined,
                location: data?.location !== undefined ? cleanString(data?.location) : undefined,
                capacity: data?.capacity !== undefined ? cleanString(data?.capacity) : undefined,
            },
        });
    }
    async remove(createdBy, idRaw) {
        const custodian = cleanString(createdBy);
        const id = cleanString(idRaw);
        const existing = await this.prisma.warehouse.findFirst({
            where: { id, registeringCustodianAddress: custodian },
            select: { id: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Không tìm thấy kho.');
        await this.prisma.warehouse.delete({ where: { id } });
        return { id };
    }
};
exports.WarehouseService = WarehouseService;
exports.WarehouseService = WarehouseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarehouseService);
//# sourceMappingURL=warehouse.service.js.map