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
exports.MultisigController = void 0;
const common_1 = require("@nestjs/common");
const multisig_service_1 = require("./multisig.service");
const multisig_dto_1 = require("./dto/multisig.dto");
let MultisigController = class MultisigController {
    constructor(multisig) {
        this.multisig = multisig;
    }
    getScriptAddress() {
        return { scriptAddress: this.multisig.getScriptAddress() };
    }
    async getScriptUtxos(scriptAddress) {
        const utxos = await this.multisig.getScriptUtxos(scriptAddress);
        return { utxos };
    }
    async getScriptUtxoByAsset(policyId, assetName, scriptAddress) {
        if (!(policyId === null || policyId === void 0 ? void 0 : policyId.trim()) || !(assetName === null || assetName === void 0 ? void 0 : assetName.trim())) {
            throw new common_1.BadRequestException("Missing policyId or assetName");
        }
        const utxo = await this.multisig.getScriptUtxoByAsset(policyId.trim(), assetName.trim(), (scriptAddress === null || scriptAddress === void 0 ? void 0 : scriptAddress.trim()) || undefined);
        return { utxo };
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
            throw new common_1.BadRequestException("Missing scriptAddress, ownersPkh, threshold, recipientPkh, assets, changeAddress or utxos");
        }
        const unsignedTx = await this.multisig.buildLockTx({
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
    async parseDatum(body) {
        var _a, _b;
        if (!((_a = body.scriptUtxo) === null || _a === void 0 ? void 0 : _a.input) || !((_b = body.scriptUtxo) === null || _b === void 0 ? void 0 : _b.output)) {
            throw new common_1.BadRequestException("Missing scriptUtxo (input + output)");
        }
        return this.multisig.parseDatumFromUtxo(body.scriptUtxo);
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
            throw new common_1.BadRequestException("Missing scriptUtxo, outputAddress, signingOwnersPkh, threshold, collateral, changeAddress or utxos");
        }
        if (body.signingOwnersPkh.length < body.threshold) {
            throw new common_1.BadRequestException(`signingOwnersPkh.length (${body.signingOwnersPkh.length}) < threshold (${body.threshold})`);
        }
        const unsignedTx = await this.multisig.buildUnlockTx({
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
            throw new common_1.BadRequestException("Missing partialTxHex or secondSignerResultHex");
        }
        return this.multisig.mergePartialTx(body.partialTxHex, body.secondSignerResultHex);
    }
    inspectTx(txHex) {
        if (!(txHex === null || txHex === void 0 ? void 0 : txHex.trim())) {
            throw new common_1.BadRequestException("Missing query txHex");
        }
        return this.multisig.inspectTx(txHex);
    }
};
exports.MultisigController = MultisigController;
__decorate([
    (0, common_1.Get)("script-address"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], MultisigController.prototype, "getScriptAddress", null);
__decorate([
    (0, common_1.Get)("script-utxos"),
    __param(0, (0, common_1.Query)("scriptAddress")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MultisigController.prototype, "getScriptUtxos", null);
__decorate([
    (0, common_1.Get)("script-utxo-by-asset"),
    __param(0, (0, common_1.Query)("policyId")),
    __param(1, (0, common_1.Query)("assetName")),
    __param(2, (0, common_1.Query)("scriptAddress")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MultisigController.prototype, "getScriptUtxoByAsset", null);
__decorate([
    (0, common_1.Post)("build-lock-tx"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [multisig_dto_1.BuildLockTxDto]),
    __metadata("design:returntype", Promise)
], MultisigController.prototype, "buildLockTx", null);
__decorate([
    (0, common_1.Post)("parse-datum"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [multisig_dto_1.ParseDatumDto]),
    __metadata("design:returntype", Promise)
], MultisigController.prototype, "parseDatum", null);
__decorate([
    (0, common_1.Post)("build-unlock-tx"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [multisig_dto_1.BuildUnlockTxDto]),
    __metadata("design:returntype", Promise)
], MultisigController.prototype, "buildUnlockTx", null);
__decorate([
    (0, common_1.Post)("merge-partial-tx"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [multisig_dto_1.MergePartialTxDto]),
    __metadata("design:returntype", Object)
], MultisigController.prototype, "mergePartialTx", null);
__decorate([
    (0, common_1.Get)("inspect-tx"),
    __param(0, (0, common_1.Query)("txHex")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], MultisigController.prototype, "inspectTx", null);
exports.MultisigController = MultisigController = __decorate([
    (0, common_1.Controller)("multisig"),
    __metadata("design:paramtypes", [multisig_service_1.MultisigService])
], MultisigController);
//# sourceMappingURL=multisig.controller.js.map