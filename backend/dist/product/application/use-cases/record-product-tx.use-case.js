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
const product_helpers_1 = require("../../product.helpers");
const warehouse_service_1 = require("../../../warehouse/warehouse.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
let RecordProductTxUseCase = class RecordProductTxUseCase {
    constructor(repository, warehouse, prisma) {
        this.repository = repository;
        this.warehouse = warehouse;
        this.prisma = prisma;
    }
    async execute(params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const { action, txHash, assetName, profileId } = params;
        if (action === "MINT") {
            const name = (_a = params.name) !== null && _a !== void 0 ? _a : "";
            const description = (_b = params.description) !== null && _b !== void 0 ? _b : "";
            const image = (_c = params.image) !== null && _c !== void 0 ? _c : "";
            const properties = params.properties != null ? params.properties : {};
            const metadata = params.metadata != null && typeof params.metadata === "object"
                ? params.metadata
                : {
                    name,
                    description,
                    image,
                    standard: (_d = params.standard) !== null && _d !== void 0 ? _d : "Traceability-v1",
                };
            const mintParams = {
                code: assetName,
                name,
                description: description || null,
                image: image || null,
                standard: (_e = params.standard) !== null && _e !== void 0 ? _e : "Traceability-v1",
                properties,
                metadata,
                mintTxHash: txHash,
                policyId: params.policyId,
                minterProfileId: profileId,
            };
            await this.repository.upsertBatchOnMint(mintParams);
            const receivers = (_f = params.receivers) !== null && _f !== void 0 ? _f : [];
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
            const updatePatch = {
                lastUpdateTxHash: txHash,
                lastUpdateAt: new Date().toISOString(),
            };
            const nextMetadata = params.metadata && typeof params.metadata === "object"
                ? (0, product_helpers_1.mergeDbMeta)(batch.metadata, Object.assign(Object.assign({}, params.metadata), updatePatch))
                : (0, product_helpers_1.mergeDbMeta)(batch.metadata, updatePatch);
            const nextProperties = params.properties != null
                ? params.properties
                : ((_g = batch.properties) !== null && _g !== void 0 ? _g : {});
            const nextDescription = params.description !== undefined
                ? params.description
                : batch.description;
            await this.repository.updateBatch({
                code: assetName,
                name: (_h = params.name) !== null && _h !== void 0 ? _h : batch.name,
                description: nextDescription,
                image: (_j = params.image) !== null && _j !== void 0 ? _j : batch.image,
                standard: (_k = params.standard) !== null && _k !== void 0 ? _k : batch.standard,
                properties: nextProperties,
                metadata: nextMetadata,
            });
            const receivers = (_l = params.receivers) !== null && _l !== void 0 ? _l : [];
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
            const nextMetadata = (0, product_helpers_1.mergeDbMeta)(batch.metadata, {
                revokeTxHash: txHash,
                revokedAt: new Date().toISOString(),
                revoked: true,
            });
            await this.repository.markBatchRevoked(assetName, nextMetadata);
            const receivers = (_m = params.receivers) !== null && _m !== void 0 ? _m : [];
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
            const nextMetadata = (0, product_helpers_1.mergeDbMeta)(batch.metadata, {
                burnTxHash: txHash,
                burnedAt: new Date().toISOString(),
                burned: true,
            });
            await this.repository.markBatchBurned(assetName, nextMetadata);
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