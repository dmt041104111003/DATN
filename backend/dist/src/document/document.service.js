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
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let DocumentService = class DocumentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.document.findMany();
    }
    async findOne(id) {
        const item = await this.prisma.document.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Document not found');
        return item;
    }
    async findOneOwned(id, userId) {
        const item = await this.prisma.document.findUnique({
            where: { id },
            include: { product: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Document not found');
        if (item.product.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return item;
    }
    async create(userId, dto) {
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.userId !== userId)
            throw new common_1.ForbiddenException('Not your product');
        return this.prisma.document.create({ data: dto });
    }
    async update(id, userId, dto) {
        await this.findOneOwned(id, userId);
        return this.prisma.document.update({ where: { id }, data: dto });
    }
    async remove(id, userId) {
        await this.findOneOwned(id, userId);
        return this.prisma.document.delete({ where: { id } });
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentService);
//# sourceMappingURL=document.service.js.map