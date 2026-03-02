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
exports.ListOrdersForProfileUseCase = void 0;
const common_1 = require("@nestjs/common");
const order_repository_1 = require("../../domain/order.repository");
let ListOrdersForProfileUseCase = class ListOrdersForProfileUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(profileId) {
        const wallet = await this.repository.findWalletAddressByProfileId(profileId);
        if (!wallet) {
            return [];
        }
        const lower = wallet.trim().toLowerCase();
        const rows = await this.repository.findActiveDeliveriesForWallet(wallet);
        return rows
            .filter((row) => {
            const owners = Array.isArray(row.ownerAddresses)
                ? row.ownerAddresses
                : [];
            return owners.some((addr) => (addr || "").trim().toLowerCase() === lower);
        })
            .map((r) => {
            var _a, _b, _c, _d;
            return ({
                id: r.id,
                lockTxHash: r.lockTxHash,
                scriptOutputIndex: r.scriptOutputIndex,
                batchId: r.batchId,
                policyId: r.policyId,
                recipientAddress: r.recipientAddress,
                senderAddress: r.senderAddress,
                ownerAddresses: Array.isArray(r.ownerAddresses)
                    ? r.ownerAddresses
                    : [],
                status: String(r.status),
                partialSignedTxHex: (_a = r.partialSignedTxHex) !== null && _a !== void 0 ? _a : null,
                partialSignedByAddress: (_b = r.partialSignedByAddress) !== null && _b !== void 0 ? _b : null,
                secondSignedByAddress: (_c = r.secondSignedByAddress) !== null && _c !== void 0 ? _c : null,
                unlockTxHash: (_d = r.unlockTxHash) !== null && _d !== void 0 ? _d : null,
            });
        });
    }
};
exports.ListOrdersForProfileUseCase = ListOrdersForProfileUseCase;
exports.ListOrdersForProfileUseCase = ListOrdersForProfileUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(order_repository_1.ORDER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ListOrdersForProfileUseCase);
//# sourceMappingURL=list-orders-for-profile.use-case.js.map