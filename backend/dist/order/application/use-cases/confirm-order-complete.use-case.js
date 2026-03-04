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
exports.ConfirmOrderCompleteUseCase = void 0;
const common_1 = require("@nestjs/common");
const order_repository_1 = require("../../domain/order.repository");
const standalone_1 = require("../../../core/cardano/standalone");
const prisma_service_1 = require("../../../prisma/prisma.service");
const product_service_1 = require("../../../product/product.service");
let ConfirmOrderCompleteUseCase = class ConfirmOrderCompleteUseCase {
    constructor(repository, prisma, product) {
        this.repository = repository;
        this.prisma = prisma;
        this.product = product;
    }
    async execute(params) {
        var _a, _b;
        const { unlockTxHash, witnessCount, signedByAddress, deliveryId } = params;
        if (witnessCount < 2) {
            throw new common_1.BadRequestException("Order completion requires at least 2 signatures (witnessCount >= 2).");
        }
        let delivery = null;
        if (deliveryId != null &&
            Number.isInteger(deliveryId) &&
            deliveryId > 0) {
            const found = await this.repository.findActiveDeliveryById(deliveryId);
            if (found) {
                delivery = found;
            }
        }
        if (!delivery) {
            const tx = await standalone_1.blockfrostFetcher.fetchTransactionsUTxO(unlockTxHash.trim());
            const inputs = (_a = tx === null || tx === void 0 ? void 0 : tx.inputs) !== null && _a !== void 0 ? _a : [];
            for (const inp of inputs) {
                const lockTxHash = inp.tx_hash;
                const scriptOutputIndex = (_b = inp.output_index) !== null && _b !== void 0 ? _b : 0;
                const found = await this.repository.findActiveDeliveryByLockHashAndIndex(lockTxHash, scriptOutputIndex);
                if (found) {
                    delivery = found;
                    break;
                }
            }
        }
        if (!delivery) {
            throw new common_1.BadRequestException("No matching order (IN_TRANSIT) found for this completion tx. Ensure order was confirmed first, or pass deliveryId.");
        }
        const secondAddr = (signedByAddress || "").trim() || null;
        await this.repository.markOrderDelivered(delivery.id, unlockTxHash.trim(), secondAddr);
        const profile = await this.prisma.profile.findFirst({
            where: {
                walletAddress: delivery.recipientAddress.trim(),
                roleCode: { in: ["TRANSIT", "AGENT"] },
            },
            select: { id: true },
        });
        if (profile) {
            await this.product.addToWarehouse(profile.id, delivery.batchId);
        }
        return { ok: true, recipientAddress: delivery.recipientAddress };
    }
};
exports.ConfirmOrderCompleteUseCase = ConfirmOrderCompleteUseCase;
exports.ConfirmOrderCompleteUseCase = ConfirmOrderCompleteUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(order_repository_1.ORDER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService,
        product_service_1.ProductService])
], ConfirmOrderCompleteUseCase);
//# sourceMappingURL=confirm-order-complete.use-case.js.map