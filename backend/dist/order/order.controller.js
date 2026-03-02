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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
const auth_service_1 = require("../auth/auth.service");
const order_dto_1 = require("./dto/order.dto");
let OrderController = class OrderController {
    constructor(order, auth) {
        this.order = order;
        this.auth = auth;
    }
    getScriptAddress() {
        return { scriptAddress: this.order.getScriptAddress() };
    }
    async getScriptUtxos(scriptAddress) {
        const utxos = await this.order.getScriptUtxos(scriptAddress);
        return { utxos };
    }
    async getScriptUtxoByAsset(policyId, assetName, scriptAddress) {
        if (!(policyId === null || policyId === void 0 ? void 0 : policyId.trim()) || !(assetName === null || assetName === void 0 ? void 0 : assetName.trim())) {
            throw new common_1.BadRequestException("Missing policyId or assetName.");
        }
        const utxo = await this.order.getScriptUtxoByAsset(policyId.trim(), assetName.trim(), (scriptAddress === null || scriptAddress === void 0 ? void 0 : scriptAddress.trim()) || undefined);
        return { utxo };
    }
    async parseDatum(body) {
        var _a, _b;
        if (!((_a = body.scriptUtxo) === null || _a === void 0 ? void 0 : _a.input) || !((_b = body.scriptUtxo) === null || _b === void 0 ? void 0 : _b.output)) {
            throw new common_1.BadRequestException("Missing scriptUtxo (input + output).");
        }
        return this.order.parseDatumFromUtxo(body.scriptUtxo);
    }
    async buildLockTx(body) {
        var _a, _b, _c;
        if (!body.scriptAddress ||
            !((_a = body.ownersPkh) === null || _a === void 0 ? void 0 : _a.length) ||
            body.threshold == null ||
            !body.recipientPkh ||
            !((_b = body.assets) === null || _b === void 0 ? void 0 : _b.length) ||
            !body.changeAddress ||
            !((_c = body.utxos) === null || _c === void 0 ? void 0 : _c.length)) {
            throw new common_1.BadRequestException("Missing scriptAddress, ownersPkh, threshold, recipientPkh, assets, changeAddress or utxos.");
        }
        const unsignedTx = await this.order.buildLockTx({
            scriptAddress: body.scriptAddress,
            ownersPkh: body.ownersPkh,
            threshold: body.threshold,
            recipientPkh: body.recipientPkh,
            assets: body.assets,
            changeAddress: body.changeAddress,
            utxos: body.utxos,
        });
        return {
            unsignedTx,
            scriptAddress: body.scriptAddress,
        };
    }
    async confirmOrder(body) {
        var _a, _b, _c, _d, _e;
        if (!((_a = body.lockTxHash) === null || _a === void 0 ? void 0 : _a.trim()) || !((_b = body.batchId) === null || _b === void 0 ? void 0 : _b.trim()) || !((_c = body.recipientAddress) === null || _c === void 0 ? void 0 : _c.trim())) {
            throw new common_1.BadRequestException("Missing lockTxHash, batchId or recipientAddress.");
        }
        if (!((_d = body.senderAddress) === null || _d === void 0 ? void 0 : _d.trim())) {
            throw new common_1.BadRequestException("Missing senderAddress.");
        }
        if (!Array.isArray(body.ownerAddresses)) {
            throw new common_1.BadRequestException("ownerAddresses must be an array.");
        }
        return this.order.recordOrder({
            lockTxHash: body.lockTxHash,
            scriptOutputIndex: (_e = body.scriptOutputIndex) !== null && _e !== void 0 ? _e : 0,
            batchId: body.batchId,
            policyId: body.policyId,
            recipientAddress: body.recipientAddress,
            senderAddress: body.senderAddress,
            ownerAddresses: body.ownerAddresses,
        });
    }
    async getDeliveries(token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const deliveries = await this.order.listOrdersForProfile(profileId);
        return { deliveries };
    }
    async savePartialTx(id, token, body) {
        var _a;
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const deliveryId = Number(id);
        if (!Number.isInteger(deliveryId) || deliveryId < 1) {
            throw new common_1.BadRequestException("Invalid delivery id.");
        }
        if (!((_a = body.partialTxHex) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw new common_1.BadRequestException("Missing partialTxHex.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        return this.order.savePartialSignedTx(deliveryId, profileId, body.partialTxHex.trim());
    }
    async buildUnlockTx(body) {
        var _a, _b, _c, _d;
        if (!((_a = body.scriptUtxo) === null || _a === void 0 ? void 0 : _a.input) ||
            !((_b = body.scriptUtxo) === null || _b === void 0 ? void 0 : _b.output) ||
            !body.outputAddress ||
            !((_c = body.signingOwnersPkh) === null || _c === void 0 ? void 0 : _c.length) ||
            body.threshold == null ||
            !((_d = body.collateral) === null || _d === void 0 ? void 0 : _d.input) ||
            !body.changeAddress ||
            !body.utxos) {
            throw new common_1.BadRequestException("Missing scriptUtxo, outputAddress, signingOwnersPkh, threshold, collateral, changeAddress or utxos.");
        }
        if (body.signingOwnersPkh.length < body.threshold) {
            throw new common_1.BadRequestException(`signingOwnersPkh.length (${body.signingOwnersPkh.length}) < threshold (${body.threshold}).`);
        }
        const unsignedTx = await this.order.buildUnlockTx({
            scriptUtxo: body.scriptUtxo,
            outputAddress: body.outputAddress,
            signingOwnersPkh: body.signingOwnersPkh,
            threshold: body.threshold,
            collateral: body.collateral,
            changeAddress: body.changeAddress,
            utxos: body.utxos,
        });
        return { unsignedTx };
    }
    mergePartialTx(body) {
        if (!body.partialTxHex || !body.secondSignerResultHex) {
            throw new common_1.BadRequestException("Missing partialTxHex or secondSignerResultHex.");
        }
        return this.order.mergePartialTx(body.partialTxHex, body.secondSignerResultHex);
    }
    inspectTx(txHex) {
        if (!(txHex === null || txHex === void 0 ? void 0 : txHex.trim())) {
            throw new common_1.BadRequestException("Missing query txHex.");
        }
        return this.order.inspectTx(txHex);
    }
    async completeOrder(body) {
        var _a, _b;
        if (!((_a = body.unlockTxHash) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw new common_1.BadRequestException("Missing unlockTxHash.");
        }
        if (typeof body.witnessCount !== "number" || body.witnessCount < 2) {
            throw new common_1.BadRequestException("witnessCount is required and must be >= 2.");
        }
        return this.order.confirmOrderComplete({
            unlockTxHash: body.unlockTxHash,
            witnessCount: body.witnessCount,
            signedByAddress: ((_b = body.signedByAddress) === null || _b === void 0 ? void 0 : _b.trim()) || undefined,
            deliveryId: body.deliveryId,
        });
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Get)("script-address"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], OrderController.prototype, "getScriptAddress", null);
__decorate([
    (0, common_1.Get)("script-utxos"),
    __param(0, (0, common_1.Query)("scriptAddress")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getScriptUtxos", null);
__decorate([
    (0, common_1.Get)("script-utxo-by-asset"),
    __param(0, (0, common_1.Query)("policyId")),
    __param(1, (0, common_1.Query)("assetName")),
    __param(2, (0, common_1.Query)("scriptAddress")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getScriptUtxoByAsset", null);
__decorate([
    (0, common_1.Post)("parse-datum"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_1.ParseDatumDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "parseDatum", null);
__decorate([
    (0, common_1.Post)("build-lock-tx"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_1.BuildLockTxDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "buildLockTx", null);
__decorate([
    (0, common_1.Post)("confirm"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_1.OrderConfirmDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "confirmOrder", null);
__decorate([
    (0, common_1.Get)("deliveries"),
    __param(0, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getDeliveries", null);
__decorate([
    (0, common_1.Post)("deliveries/:id/save-partial-tx"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("token")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, order_dto_1.SavePartialTxDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "savePartialTx", null);
__decorate([
    (0, common_1.Post)("build-unlock-tx"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_1.BuildUnlockTxDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "buildUnlockTx", null);
__decorate([
    (0, common_1.Post)("merge-partial-tx"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_1.MergePartialTxDto]),
    __metadata("design:returntype", Object)
], OrderController.prototype, "mergePartialTx", null);
__decorate([
    (0, common_1.Get)("inspect-tx"),
    __param(0, (0, common_1.Query)("txHex")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], OrderController.prototype, "inspectTx", null);
__decorate([
    (0, common_1.Post)("complete"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_1.OrderCompleteDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "completeOrder", null);
exports.OrderController = OrderController = __decorate([
    (0, common_1.Controller)("order"),
    __metadata("design:paramtypes", [order_service_1.OrderService,
        auth_service_1.AuthService])
], OrderController);
//# sourceMappingURL=order.controller.js.map