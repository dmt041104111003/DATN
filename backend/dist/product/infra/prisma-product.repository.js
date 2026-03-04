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
            where: { minterProfileId: profileId, revoked: false },
            select: {
                id: true,
                batchId: true,
                name: true,
                description: true,
                image: true,
                createdAt: true,
                policyId: true,
                sku: true,
                grossWeightKg: true,
                netWeightKg: true,
                originSiteCode: true,
            },
            orderBy: [{ createdAt: "asc" }, { batchId: "asc" }],
        });
        if (!Array.isArray(items))
            return [];
        return items.map((b) => {
            var _a, _b, _c, _d, _e, _f, _g;
            return ({
                id: b.id,
                batchId: b.batchId,
                name: b.name,
                description: (_a = b.description) !== null && _a !== void 0 ? _a : null,
                image: (_b = b.image) !== null && _b !== void 0 ? _b : null,
                createdAt: b.createdAt,
                policyId: (_c = b.policyId) !== null && _c !== void 0 ? _c : null,
                sku: (_d = b.sku) !== null && _d !== void 0 ? _d : null,
                grossWeightKg: (_e = b.grossWeightKg) !== null && _e !== void 0 ? _e : null,
                netWeightKg: (_f = b.netWeightKg) !== null && _f !== void 0 ? _f : null,
                originSiteCode: (_g = b.originSiteCode) !== null && _g !== void 0 ? _g : null,
            });
        });
    }
    async upsertBatchOnMint(params) {
        const { batchId, name, description, image, standard, mintTxHash, policyId, minterProfileId, expiryDate, sku, grossWeightKg, netWeightKg, originSiteCode, referenceUtxo, } = params;
        await this.prisma.productBatch.upsert({
            where: { batchId },
            create: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ batchId,
                name,
                description,
                image,
                standard,
                mintTxHash, policyId: policyId !== null && policyId !== void 0 ? policyId : undefined, minterProfileId }, (expiryDate !== undefined && { expiryDate })), (sku !== undefined && { sku })), (grossWeightKg !== undefined && { grossWeightKg })), (netWeightKg !== undefined && { netWeightKg })), (originSiteCode !== undefined && { originSiteCode })), (referenceUtxo !== undefined && { referenceUtxo })),
            update: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ mintTxHash,
                name,
                description,
                image,
                standard, policyId: policyId !== null && policyId !== void 0 ? policyId : undefined }, (expiryDate !== undefined && { expiryDate })), (sku !== undefined && { sku })), (grossWeightKg !== undefined && { grossWeightKg })), (netWeightKg !== undefined && { netWeightKg })), (originSiteCode !== undefined && { originSiteCode })), (referenceUtxo !== undefined && { referenceUtxo })),
        });
    }
    async findBatchByCode(code) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        const batch = await this.prisma.productBatch.findUnique({
            where: { batchId: code },
        });
        if (!batch)
            return null;
        return {
            batchId: batch.batchId,
            name: batch.name,
            description: (_a = batch.description) !== null && _a !== void 0 ? _a : null,
            image: (_b = batch.image) !== null && _b !== void 0 ? _b : null,
            standard: (_c = batch.standard) !== null && _c !== void 0 ? _c : null,
            policyId: (_d = batch.policyId) !== null && _d !== void 0 ? _d : null,
            expiryDate: (_e = batch.expiryDate) !== null && _e !== void 0 ? _e : null,
            sku: (_f = batch.sku) !== null && _f !== void 0 ? _f : null,
            grossWeightKg: (_g = batch.grossWeightKg) !== null && _g !== void 0 ? _g : null,
            netWeightKg: (_h = batch.netWeightKg) !== null && _h !== void 0 ? _h : null,
            originSiteCode: (_j = batch.originSiteCode) !== null && _j !== void 0 ? _j : null,
            referenceUtxo: (_k = batch.referenceUtxo) !== null && _k !== void 0 ? _k : null,
            lastUpdateTxHash: (_l = batch.lastUpdateTxHash) !== null && _l !== void 0 ? _l : null,
            lastUpdateAt: (_m = batch.lastUpdateAt) !== null && _m !== void 0 ? _m : null,
            revokeTxHash: (_o = batch.revokeTxHash) !== null && _o !== void 0 ? _o : null,
            revokedAt: (_p = batch.revokedAt) !== null && _p !== void 0 ? _p : null,
            revoked: (_q = batch.revoked) !== null && _q !== void 0 ? _q : false,
            burnTxHash: (_r = batch.burnTxHash) !== null && _r !== void 0 ? _r : null,
            burnedAt: (_s = batch.burnedAt) !== null && _s !== void 0 ? _s : null,
            burned: (_t = batch.burned) !== null && _t !== void 0 ? _t : false,
        };
    }
    async getMinterWalletAddressByBatchCode(code) {
        var _a;
        const row = await this.prisma.productBatch.findUnique({
            where: { batchId: code },
            select: {
                minterProfile: {
                    select: {
                        walletAddress: true,
                    },
                },
            },
        });
        const addr = (_a = row === null || row === void 0 ? void 0 : row.minterProfile) === null || _a === void 0 ? void 0 : _a.walletAddress;
        return typeof addr === "string" && addr.trim() ? addr.trim() : null;
    }
    async updateBatch(params) {
        const { batchId, name, description, image, standard, expiryDate, lastUpdateTxHash, lastUpdateAt, sku, grossWeightKg, netWeightKg, originSiteCode, } = params;
        await this.prisma.productBatch.update({
            where: { batchId },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name !== undefined && { name })), (description !== undefined && { description })), (image !== undefined && { image })), (standard !== undefined && { standard })), (expiryDate !== undefined && { expiryDate })), (lastUpdateTxHash !== undefined && { lastUpdateTxHash })), (lastUpdateAt !== undefined && { lastUpdateAt })), (sku !== undefined && { sku })), (grossWeightKg !== undefined && { grossWeightKg })), (netWeightKg !== undefined && { netWeightKg })), (originSiteCode !== undefined && { originSiteCode })),
        });
    }
    async markBatchRevoked(code) {
        await this.prisma.productBatch.update({
            where: { batchId: code },
            data: {
                revoked: true,
                revokeTxHash: undefined,
                revokedAt: new Date(),
            },
        });
    }
    async markBatchBurned(code, burnTxHash) {
        await this.prisma.productBatch.update({
            where: { batchId: code },
            data: {
                burned: true,
                burnTxHash,
                burnedAt: new Date(),
            },
        });
    }
    async createRoadmaps(batchId, action, fromAddress, receivers, txHash) {
        if (receivers.length === 0)
            return;
        await this.prisma.roadmap.createMany({
            data: receivers.map((toAddress, stepIndex) => ({
                batchId,
                fromAddress,
                toAddress,
                stepIndex,
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
            orderBy: { stepIndex: "asc" },
            select: { stepIndex: true, fromAddress: true, toAddress: true },
        });
        if (!Array.isArray(rows))
            return [];
        return rows.map((r) => ({
            stepIndex: r.stepIndex,
            fromAddress: r.fromAddress,
            toAddress: r.toAddress,
        }));
    }
};
exports.PrismaProductRepository = PrismaProductRepository;
exports.PrismaProductRepository = PrismaProductRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaProductRepository);
//# sourceMappingURL=prisma-product.repository.js.map