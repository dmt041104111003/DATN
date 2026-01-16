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
exports.ProductMaterialService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let ProductMaterialService = class ProductMaterialService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByProduct(productId, userId) {
        await this.checkProductOwnership(productId, userId);
        return this.prisma.productMaterial.findMany({
            where: { productId },
            include: {
                material: {
                    include: { supplier: true },
                },
            },
        });
    }
    async findOne(id, userId) {
        const pm = await this.prisma.productMaterial.findUnique({
            where: { id },
            include: {
                product: true,
                material: {
                    include: { supplier: true },
                },
            },
        });
        if (!pm)
            throw new common_1.NotFoundException('ProductMaterial not found');
        if (pm.product.userId !== userId)
            throw new common_1.ForbiddenException('Not your product');
        return pm;
    }
    async create(userId, dto) {
        await this.checkProductOwnership(dto.productId, userId);
        await this.checkMaterialOwnership(dto.materialId, userId);
        return this.prisma.productMaterial.create({
            data: dto,
            include: {
                material: {
                    include: { supplier: true },
                },
            },
        });
    }
    async update(id, userId, dto) {
        await this.findOneOwned(id, userId);
        return this.prisma.productMaterial.update({
            where: { id },
            data: dto,
            include: {
                material: {
                    include: { supplier: true },
                },
            },
        });
    }
    async remove(id, userId) {
        await this.findOneOwned(id, userId);
        return this.prisma.productMaterial.delete({ where: { id } });
    }
    async findOneOwned(id, userId) {
        const pm = await this.prisma.productMaterial.findUnique({
            where: { id },
            include: { product: true },
        });
        if (!pm)
            throw new common_1.NotFoundException('ProductMaterial not found');
        if (pm.product.userId !== userId)
            throw new common_1.ForbiddenException('Not your product');
        return pm;
    }
    async checkProductOwnership(productId, userId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.userId !== userId)
            throw new common_1.ForbiddenException('Not your product');
    }
    async checkMaterialOwnership(materialId, userId) {
        const material = await this.prisma.material.findUnique({
            where: { id: materialId },
            include: { supplier: true },
        });
        if (!material)
            throw new common_1.NotFoundException('Material not found');
        if (material.supplier.userId !== userId)
            throw new common_1.ForbiddenException('Not your material');
    }
};
exports.ProductMaterialService = ProductMaterialService;
exports.ProductMaterialService = ProductMaterialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductMaterialService);
//# sourceMappingURL=product-material.service.js.map