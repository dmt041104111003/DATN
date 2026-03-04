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
exports.PrismaOrderRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let PrismaOrderRepository = class PrismaOrderRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findWalletAddressByProfileId(profileId) {
        var _a;
        const profile = await this.prisma.profile.findUnique({
            where: { id: profileId },
            select: { walletAddress: true },
        });
        const addr = (_a = profile === null || profile === void 0 ? void 0 : profile.walletAddress) === null || _a === void 0 ? void 0 : _a.trim();
        return addr && addr.length > 0 ? addr : null;
    }
    async findActiveDeliveriesForWallet(walletAddress) {
        const rows = await this.prisma.deliveryOrder.findMany({
            where: {
                status: { in: [client_1.DeliveryStatus.IN_TRANSIT, client_1.DeliveryStatus.DELIVERED] },
                NOT: { senderAddress: walletAddress },
            },
            orderBy: { createdAt: "desc" },
        });
        return rows;
    }
    async savePartialSignedTx(deliveryId, walletAddress, partialTxHex) {
        await this.prisma.$executeRaw(client_1.Prisma.sql `UPDATE "DeliveryOrder" SET "partialSignedTxHex" = ${partialTxHex}, "partialSignedByAddress" = ${walletAddress} WHERE id = ${deliveryId}`);
    }
    async upsertDeliveryOrder(params) {
        var _a, _b, _c, _d, _e, _f, _g;
        const scriptOutputIndex = (_a = params.scriptOutputIndex) !== null && _a !== void 0 ? _a : 0;
        const ownerAddresses = Array.isArray(params.ownerAddresses)
            ? params.ownerAddresses
            : [];
        const delivery = await this.prisma.deliveryOrder.upsert({
            where: {
                lockTxHash_scriptOutputIndex: {
                    lockTxHash: params.lockTxHash.trim(),
                    scriptOutputIndex,
                },
            },
            create: Object.assign(Object.assign({ lockTxHash: params.lockTxHash.trim(), scriptOutputIndex, batchId: params.batchId.trim(), policyId: (_c = (_b = params.policyId) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : null, scriptAddress: (_e = (_d = params.scriptAddress) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : null, datumHash: (_g = (_f = params.datumHash) === null || _f === void 0 ? void 0 : _f.trim()) !== null && _g !== void 0 ? _g : null }, (params.datumJson !== undefined && {
                datumJson: params.datumJson,
            })), { recipientAddress: params.recipientAddress.trim(), senderAddress: params.senderAddress.trim(), ownerAddresses, status: client_1.DeliveryStatus.IN_TRANSIT }),
            update: {},
        });
        return { id: delivery.id };
    }
    async findActiveDeliveryById(id) {
        const found = await this.prisma.deliveryOrder.findUnique({
            where: { id },
        });
        if (!found || found.status !== client_1.DeliveryStatus.IN_TRANSIT)
            return null;
        return {
            id: found.id,
            batchId: found.batchId,
            recipientAddress: found.recipientAddress,
        };
    }
    async findActiveDeliveryByLockHashAndIndex(lockTxHash, scriptOutputIndex) {
        const found = await this.prisma.deliveryOrder.findUnique({
            where: {
                lockTxHash_scriptOutputIndex: {
                    lockTxHash,
                    scriptOutputIndex,
                },
            },
        });
        if (!found || found.status !== client_1.DeliveryStatus.IN_TRANSIT)
            return null;
        return {
            id: found.id,
            batchId: found.batchId,
            recipientAddress: found.recipientAddress,
        };
    }
    async markOrderDelivered(id, unlockTxHash, secondSignedByAddress) {
        await this.prisma.$executeRaw(client_1.Prisma.sql `UPDATE "DeliveryOrder" SET status = 'DELIVERED', "unlockTxHash" = ${unlockTxHash}, "secondSignedByAddress" = ${secondSignedByAddress} WHERE id = ${id}`);
    }
};
exports.PrismaOrderRepository = PrismaOrderRepository;
exports.PrismaOrderRepository = PrismaOrderRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaOrderRepository);
//# sourceMappingURL=prisma-order.repository.js.map