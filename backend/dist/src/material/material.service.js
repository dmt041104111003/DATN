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
exports.MaterialService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let MaterialService = class MaterialService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllByUser(userId) {
        return this.prisma.material.findMany({
            where: {
                supplier: { userId },
            },
            include: { supplier: true },
        });
    }
    async findBySupplier(supplierId, userId) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: supplierId },
        });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        if (supplier.userId !== userId)
            throw new common_1.ForbiddenException('Not your supplier');
        return this.prisma.material.findMany({ where: { supplierId } });
    }
    async findOne(id, userId) {
        const item = await this.prisma.material.findUnique({
            where: { id },
            include: { supplier: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Material not found');
        if (item.supplier.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return item;
    }
    async create(userId, dto) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: dto.supplierId },
        });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        if (supplier.userId !== userId)
            throw new common_1.ForbiddenException('Not your supplier');
        return this.prisma.material.create({
            data: {
                supplierId: dto.supplierId,
                name: dto.name,
                harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : null,
                quantity: dto.quantity ?? 0,
                userId,
            },
        });
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        return this.prisma.material.update({ where: { id }, data: dto });
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        return this.prisma.material.delete({ where: { id } });
    }
};
exports.MaterialService = MaterialService;
exports.MaterialService = MaterialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaterialService);
//# sourceMappingURL=material.service.js.map