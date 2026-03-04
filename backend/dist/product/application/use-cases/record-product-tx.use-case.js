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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
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
            const minterProfile = await this.prisma.profile.findUnique({
                where: { id: profileId },
                select: { walletAddress: true, location: true },
            });
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
                grossWeightKg: master.grossWeightKg != null ? Number(master.grossWeightKg) : null,
                netWeightKg: master.netWeightKg != null ? Number(master.netWeightKg) : null,
                originSiteCode: (_j = minterProfile === null || minterProfile === void 0 ? void 0 : minterProfile.location) !== null && _j !== void 0 ? _j : null,
                referenceUtxo: `${txHash}#0`,
            };
            await this.repository.upsertBatchOnMint(mintParams);
            const receivers = (_k = params.receivers) !== null && _k !== void 0 ? _k : [];
            if (receivers.length > 0) {
                const profile = minterProfile;
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
            let nextExpiryDate = (_l = batch.expiryDate) !== null && _l !== void 0 ? _l : null;
            const baseProps = (_m = params.properties) !== null && _m !== void 0 ? _m : {};
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
            const updaterProfile = await this.prisma.profile.findUnique({
                where: { id: profileId },
                select: { walletAddress: true, location: true },
            });
            await this.repository.updateBatch({
                batchId: assetName,
                name: (_o = params.name) !== null && _o !== void 0 ? _o : batch.name,
                description: nextDescription,
                image: (_p = params.image) !== null && _p !== void 0 ? _p : batch.image,
                standard: (_q = params.standard) !== null && _q !== void 0 ? _q : batch.standard,
                expiryDate: nextExpiryDate !== null && nextExpiryDate !== void 0 ? nextExpiryDate : null,
                lastUpdateTxHash: txHash,
                lastUpdateAt: new Date().toISOString(),
                sku: (_s = (_r = baseProps.sku) !== null && _r !== void 0 ? _r : batch.sku) !== null && _s !== void 0 ? _s : null,
                grossWeightKg: baseProps.grossWeightKg != null
                    ? Number(baseProps.grossWeightKg)
                    : (_t = batch.grossWeightKg) !== null && _t !== void 0 ? _t : null,
                netWeightKg: baseProps.netWeightKg != null
                    ? Number(baseProps.netWeightKg)
                    : (_u = batch.netWeightKg) !== null && _u !== void 0 ? _u : null,
                originSiteCode: (_w = (_v = updaterProfile === null || updaterProfile === void 0 ? void 0 : updaterProfile.location) !== null && _v !== void 0 ? _v : batch.originSiteCode) !== null && _w !== void 0 ? _w : null,
                referenceUtxo: `${txHash}#0`,
            });
            const receivers = (_x = params.receivers) !== null && _x !== void 0 ? _x : [];
            if (receivers.length > 0) {
                const profile = updaterProfile;
                const senderAddress = (profile === null || profile === void 0 ? void 0 : profile.walletAddress) && typeof profile.walletAddress === "string"
                    ? profile.walletAddress.trim()
                    : "";
                await this.repository.createRoadmaps(assetName, "UPDATE", senderAddress, receivers, txHash);
            }
            return;
        }
        if (action === "REVOKE") {
            await this.repository.markBatchRevoked(assetName);
            const receivers = (_y = params.receivers) !== null && _y !== void 0 ? _y : [];
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