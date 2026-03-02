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
exports.SavePartialSignedTxUseCase = void 0;
const common_1 = require("@nestjs/common");
const order_repository_1 = require("../../domain/order.repository");
let SavePartialSignedTxUseCase = class SavePartialSignedTxUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(deliveryId, profileId, partialTxHex) {
        const hex = (partialTxHex || "").trim().replace(/^0x/, "");
        if (hex.length < 100) {
            throw new common_1.BadRequestException("partialTxHex is too short.");
        }
        const wallet = await this.repository.findWalletAddressByProfileId(profileId);
        if (!(wallet === null || wallet === void 0 ? void 0 : wallet.trim())) {
            throw new common_1.BadRequestException("Profile or wallet not found.");
        }
        await this.repository.savePartialSignedTx(deliveryId, wallet.trim(), hex);
        return { ok: true };
    }
};
exports.SavePartialSignedTxUseCase = SavePartialSignedTxUseCase;
exports.SavePartialSignedTxUseCase = SavePartialSignedTxUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(order_repository_1.ORDER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], SavePartialSignedTxUseCase);
//# sourceMappingURL=save-partial-signed-tx.use-case.js.map