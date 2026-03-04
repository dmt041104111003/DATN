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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordProductTxUseCase = void 0;
const common_1 = require("@nestjs/common");
const product_repository_1 = require("../../domain/product.repository");
const warehouse_service_1 = require("../../../warehouse/warehouse.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
let RecordProductTxUseCase = class RecordProductTxUseCase {
    constructor(repository, warehouse, prisma) {
        this.repository = repository;
        this.warehouse = warehouse;
        this.prisma = prisma;
    }
    async execute(params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16;
        const { action, txHash, assetName, profileId } = params;
        if (action === "MINT") {
            const name = (_a = params.name) !== null && _a !== void 0 ? _a : "";
            const description = (_b = params.description) !== null && _b !== void 0 ? _b : "";
            const image = (_c = params.image) !== null && _c !== void 0 ? _c : "";
            const properties = params.properties != null ? params.properties : {};
            let expiryDate;
            const rawExpiry = (_f = (_d = properties === null || properties === void 0 ? void 0 : properties.ngayHetHan) !== null && _d !== void 0 ? _d : (_e = params.properties) === null || _e === void 0 ? void 0 : _e.ngayHetHan) !== null && _f !== void 0 ? _f : undefined;
            if (rawExpiry) {
                const d = rawExpiry instanceof Date ? rawExpiry : new Date(String(rawExpiry));
                if (!Number.isNaN(d.getTime())) {
                    expiryDate = d;
                }
            }
            const master = properties;
            const mintParams = {
                batchId: assetName,
                name,
                description: description || null,
                image: image || null,
                standard: (_g = params.standard) !== null && _g !== void 0 ? _g : "Traceability-v1",
                mintTxHash: txHash,
                policyId: params.policyId,
                minterProfileId: profileId,
                expiryDate,
                sku: (_h = master.sku) !== null && _h !== void 0 ? _h : null,
                gtin: (_j = master.gtin) !== null && _j !== void 0 ? _j : null,
                hsCode: (_k = master.hsCode) !== null && _k !== void 0 ? _k : null,
                unitOfMeasure: (_l = master.unitOfMeasure) !== null && _l !== void 0 ? _l : null,
                productCategory: (_m = master.productCategory) !== null && _m !== void 0 ? _m : null,
                grossWeightKg: master.grossWeightKg != null ? Number(master.grossWeightKg) : null,
                netWeightKg: master.netWeightKg != null ? Number(master.netWeightKg) : null,
                lengthCm: master.lengthCm != null ? Number(master.lengthCm) : null,
                widthCm: master.widthCm != null ? Number(master.widthCm) : null,
                heightCm: master.heightCm != null ? Number(master.heightCm) : null,
                storageCondition: (_o = master.storageCondition) !== null && _o !== void 0 ? _o : null,
                originSiteCode: (_p = master.originSiteCode) !== null && _p !== void 0 ? _p : null,
                referenceUtxo: `${txHash}#0`,
            };
            await this.repository.upsertBatchOnMint(mintParams);
            const receivers = (_q = params.receivers) !== null && _q !== void 0 ? _q : [];
            if (receivers.length > 0) {
                const profile = await this.prisma.profile.findUnique({
                    where: { id: profileId },
                    select: { walletAddress: true },
                });
                const senderAddress = (profile === null || profile === void 0 ? void 0 : profile.walletAddress) && typeof profile.walletAddress === "string"
                    ? profile.walletAddress.trim()
                    : "";
                await this.repository.createRoadmaps(assetName, "MINT", senderAddress, receivers, txHash);
            }
            await this.warehouse.addToWarehouse(profileId, assetName);
            return;
        }
        const batch = await this.repository.findBatchByCode(assetName);
        if (!batch) {
            throw new common_1.BadRequestException(`Batch not found: ${assetName}`);
        }
        if (action === "UPDATE") {
            let nextExpiryDate = (_r = batch.expiryDate) !== null && _r !== void 0 ? _r : null;
            const baseProps = (_s = params.properties) !== null && _s !== void 0 ? _s : {};
            const rawNextExpiry = baseProps === null || baseProps === void 0 ? void 0 : baseProps.ngayHetHan;
            if (rawNextExpiry) {
                const d = rawNextExpiry instanceof Date
                    ? rawNextExpiry
                    : new Date(String(rawNextExpiry));
                if (!Number.isNaN(d.getTime())) {
                    nextExpiryDate = d;
                }
            }
            const nextDescription = params.description !== undefined
                ? params.description
                : batch.description;
            await this.repository.updateBatch({
                batchId: assetName,
                name: (_t = params.name) !== null && _t !== void 0 ? _t : batch.name,
                description: nextDescription,
                image: (_u = params.image) !== null && _u !== void 0 ? _u : batch.image,
                standard: (_v = params.standard) !== null && _v !== void 0 ? _v : batch.standard,
                expiryDate: nextExpiryDate !== null && nextExpiryDate !== void 0 ? nextExpiryDate : null,
                lastUpdateTxHash: txHash,
                lastUpdateAt: new Date().toISOString(),
                sku: (_x = (_w = baseProps.sku) !== null && _w !== void 0 ? _w : batch.sku) !== null && _x !== void 0 ? _x : null,
                gtin: (_z = (_y = baseProps.gtin) !== null && _y !== void 0 ? _y : batch.gtin) !== null && _z !== void 0 ? _z : null,
                hsCode: (_1 = (_0 = baseProps.hsCode) !== null && _0 !== void 0 ? _0 : batch.hsCode) !== null && _1 !== void 0 ? _1 : null,
                unitOfMeasure: (_3 = (_2 = baseProps.unitOfMeasure) !== null && _2 !== void 0 ? _2 : batch.unitOfMeasure) !== null && _3 !== void 0 ? _3 : null,
                productCategory: (_5 = (_4 = baseProps.productCategory) !== null && _4 !== void 0 ? _4 : batch.productCategory) !== null && _5 !== void 0 ? _5 : null,
                grossWeightKg: baseProps.grossWeightKg != null
                    ? Number(baseProps.grossWeightKg)
                    : (_6 = batch.grossWeightKg) !== null && _6 !== void 0 ? _6 : null,
                netWeightKg: baseProps.netWeightKg != null
                    ? Number(baseProps.netWeightKg)
                    : (_7 = batch.netWeightKg) !== null && _7 !== void 0 ? _7 : null,
                lengthCm: baseProps.lengthCm != null
                    ? Number(baseProps.lengthCm)
                    : (_8 = batch.lengthCm) !== null && _8 !== void 0 ? _8 : null,
                widthCm: baseProps.widthCm != null
                    ? Number(baseProps.widthCm)
                    : (_9 = batch.widthCm) !== null && _9 !== void 0 ? _9 : null,
                heightCm: baseProps.heightCm != null
                    ? Number(baseProps.heightCm)
                    : (_10 = batch.heightCm) !== null && _10 !== void 0 ? _10 : null,
                storageCondition: (_12 = (_11 = baseProps.storageCondition) !== null && _11 !== void 0 ? _11 : batch.storageCondition) !== null && _12 !== void 0 ? _12 : null,
                originSiteCode: (_14 = (_13 = baseProps.originSiteCode) !== null && _13 !== void 0 ? _13 : batch.originSiteCode) !== null && _14 !== void 0 ? _14 : null,
                referenceUtxo: `${txHash}#0`,
            });
            const receivers = (_15 = params.receivers) !== null && _15 !== void 0 ? _15 : [];
            if (receivers.length > 0) {
                const profile = await this.prisma.profile.findUnique({
                    where: { id: profileId },
                    select: { walletAddress: true },
                });
                const senderAddress = (profile === null || profile === void 0 ? void 0 : profile.walletAddress) && typeof profile.walletAddress === "string"
                    ? profile.walletAddress.trim()
                    : "";
                await this.repository.createRoadmaps(assetName, "UPDATE", senderAddress, receivers, txHash);
            }
            return;
        }
        if (action === "REVOKE") {
            await this.repository.markBatchRevoked(assetName);
            const receivers = (_16 = params.receivers) !== null && _16 !== void 0 ? _16 : [];
            if (receivers.length > 0) {
                const profile = await this.prisma.profile.findUnique({
                    where: { id: profileId },
                    select: { walletAddress: true },
                });
                const senderAddress = (profile === null || profile === void 0 ? void 0 : profile.walletAddress) && typeof profile.walletAddress === "string"
                    ? profile.walletAddress.trim()
                    : "";
                await this.repository.createRoadmaps(assetName, "REVOKE", senderAddress, receivers, txHash);
            }
            return;
        }
        if (action === "BURN") {
            await this.repository.markBatchBurned(assetName, txHash);
            await this.warehouse.markAsBurned(profileId, assetName);
            return;
        }
    }
};
exports.RecordProductTxUseCase = RecordProductTxUseCase;
exports.RecordProductTxUseCase = RecordProductTxUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(product_repository_1.PRODUCT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, warehouse_service_1.WarehouseService,
        prisma_service_1.PrismaService])
], RecordProductTxUseCase);
//# sourceMappingURL=record-product-tx.use-case.js.map