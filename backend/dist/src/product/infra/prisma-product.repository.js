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
exports.PrismaProductRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PrismaProductRepository = class PrismaProductRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listBatchesByMinter(profileId) {
        const items = await this.prisma.productBatch.findMany({
            where: { minterProfileId: profileId },
            select: {
                id: true,
                code: true,
                name: true,
                description: true,
                image: true,
                createdAt: true,
                metadata: true,
                policyId: true,
            },
            orderBy: [{ createdAt: "asc" }, { code: "asc" }],
        });
        if (!Array.isArray(items))
            return [];
        const visible = items.filter((b) => {
            const meta = b.metadata;
            const db = meta === null || meta === void 0 ? void 0 : meta._db;
            return !db || db.revoked !== true;
        });
        return visible.map((b) => {
            var _a, _b, _c;
            return ({
                id: b.id,
                code: b.code,
                name: b.name,
                description: (_a = b.description) !== null && _a !== void 0 ? _a : null,
                image: (_b = b.image) !== null && _b !== void 0 ? _b : null,
                createdAt: b.createdAt,
                policyId: (_c = b.policyId) !== null && _c !== void 0 ? _c : null,
            });
        });
    }
    async upsertBatchOnMint(params) {
        const { code, name, description, image, standard, properties, metadata, mintTxHash, policyId, minterProfileId, } = params;
        await this.prisma.productBatch.upsert({
            where: { code },
            create: {
                code,
                name,
                description,
                image,
                standard,
                properties,
                metadata,
                mintTxHash,
                policyId: policyId !== null && policyId !== void 0 ? policyId : undefined,
                minterProfileId,
            },
            update: {
                mintTxHash,
                name,
                description,
                image,
                standard,
                properties,
                metadata,
                policyId: policyId !== null && policyId !== void 0 ? policyId : undefined,
            },
        });
    }
    async findBatchByCode(code) {
        var _a, _b, _c;
        const batch = await this.prisma.productBatch.findUnique({
            where: { code },
        });
        if (!batch)
            return null;
        return {
            code: batch.code,
            name: batch.name,
            description: (_a = batch.description) !== null && _a !== void 0 ? _a : null,
            image: (_b = batch.image) !== null && _b !== void 0 ? _b : null,
            standard: (_c = batch.standard) !== null && _c !== void 0 ? _c : null,
            properties: batch.properties,
            metadata: batch.metadata,
        };
    }
    async updateBatch(params) {
        const { code, name, description, image, standard, properties, metadata } = params;
        await this.prisma.productBatch.update({
            where: { code },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name !== undefined && { name })), (description !== undefined && { description })), (image !== undefined && { image })), (standard !== undefined && { standard })), { properties,
                metadata }),
        });
    }
    async markBatchRevoked(code, nextMetadata) {
        await this.prisma.productBatch.update({
            where: { code },
            data: {
                metadata: nextMetadata,
            },
        });
    }
    async markBatchBurned(code, nextMetadata) {
        await this.prisma.productBatch.update({
            where: { code },
            data: {
                metadata: nextMetadata,
            },
        });
    }
    async createRoadmaps(batchId, action, receivers, txHash) {
        if (receivers.length === 0)
            return;
        await this.prisma.roadmap.createMany({
            data: receivers.map((receiverAddress, hopIndex) => ({
                batchId,
                receiverAddress,
                hopIndex,
                action,
                txHash,
            })),
        });
    }
    async listRoadmap(batchId) {
        const prisma = this.prisma;
        const bid = (batchId || "").trim();
        if (!bid)
            return [];
        const rows = await prisma.roadmap.findMany({
            where: { batchId: bid },
            orderBy: { hopIndex: "asc" },
            select: { hopIndex: true, receiverAddress: true },
        });
        if (!Array.isArray(rows))
            return [];
        return rows.map((r) => ({
            hopIndex: r.hopIndex,
            receiverAddress: r.receiverAddress,
        }));
    }
};
exports.PrismaProductRepository = PrismaProductRepository;
exports.PrismaProductRepository = PrismaProductRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaProductRepository);
//# sourceMappingURL=prisma-product.repository.js.map