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
exports.TraceController = void 0;
const common_1 = require("@nestjs/common");
const trace_service_1 = require("./trace.service");
const auth_service_1 = require("../auth/auth.service");
const trace_dto_1 = require("./dto/trace.dto");
let TraceController = class TraceController {
    constructor(trace, auth) {
        this.trace = trace;
        this.auth = auth;
    }
    async listBatches(token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const items = await this.trace.listBatches(profileId);
        return { total: items.length, items };
    }
    async mint(body) {
        var _a;
        if (!body.changeAddress || !body.assetName) {
            throw new common_1.BadRequestException("Thiếu changeAddress hoặc assetName");
        }
        if (!body.metadata && (!body.name ||
            !body.image ||
            !((_a = body.receivers) === null || _a === void 0 ? void 0 : _a.length) ||
            !body.receiverLocations ||
            !body.receiverCoordinates ||
            !body.minterLocation ||
            !body.minterCoordinates)) {
            throw new common_1.BadRequestException("Thiếu metadata hoặc (name, image, receivers, receiverLocations, receiverCoordinates, minterLocation, minterCoordinates)");
        }
        return this.trace.mint({
            changeAddress: body.changeAddress,
            assetName: body.assetName,
            metadata: body.metadata,
            receiver: body.receiver,
            name: body.name,
            image: body.image,
            receivers: body.receivers,
            receiverLocations: body.receiverLocations,
            receiverCoordinates: body.receiverCoordinates,
            minterLocation: body.minterLocation,
            minterCoordinates: body.minterCoordinates,
            propertiesJson: body.propertiesJson,
            walletUtxos: body.walletUtxos,
            utxoAddresses: body.utxoAddresses,
        });
    }
    async update(body) {
        var _a;
        if (!body.changeAddress || !body.assetName) {
            throw new common_1.BadRequestException("Thiếu changeAddress hoặc assetName");
        }
        if (!body.metadata && (!body.name ||
            !body.image ||
            !((_a = body.receivers) === null || _a === void 0 ? void 0 : _a.length) ||
            !body.receiverLocations ||
            !body.receiverCoordinates ||
            !body.minterLocation ||
            !body.minterCoordinates)) {
            throw new common_1.BadRequestException("Thiếu metadata hoặc (name, image, receivers, receiverLocations, receiverCoordinates, minterLocation, minterCoordinates)");
        }
        return this.trace.update({
            changeAddress: body.changeAddress,
            assetName: body.assetName,
            txHash: body.txHash,
            metadata: body.metadata,
            name: body.name,
            image: body.image,
            receivers: body.receivers,
            receiverLocations: body.receiverLocations,
            receiverCoordinates: body.receiverCoordinates,
            minterLocation: body.minterLocation,
            minterCoordinates: body.minterCoordinates,
            propertiesJson: body.propertiesJson,
            walletUtxos: body.walletUtxos,
            utxoAddresses: body.utxoAddresses,
        });
    }
    async revoke(body) {
        if (!body.changeAddress || !body.assetName) {
            throw new common_1.BadRequestException("Thiếu changeAddress hoặc assetName");
        }
        return this.trace.revoke({
            changeAddress: body.changeAddress,
            assetName: body.assetName,
            txHash: body.txHash,
            walletUtxos: body.walletUtxos,
            utxoAddresses: body.utxoAddresses,
        });
    }
    async mintConfirm(body) {
        var _a;
        if (!body.txHash || !body.assetName || !body.name || body.minterProfileId == null) {
            throw new common_1.BadRequestException("Thiếu txHash, assetName, name hoặc minterProfileId");
        }
        await this.trace.recordTx({
            action: "MINT",
            txHash: body.txHash,
            assetName: body.assetName,
            profileId: body.minterProfileId,
            name: body.name,
            image: (_a = body.image) !== null && _a !== void 0 ? _a : "",
            standard: body.standard,
            properties: body.properties,
            metadata: body.metadata,
        });
        return { ok: true };
    }
    async updateConfirm(body) {
        if (!body.txHash || !body.assetName || body.profileId == null) {
            throw new common_1.BadRequestException("Thiếu txHash, assetName hoặc profileId");
        }
        await this.trace.recordTx({
            action: "UPDATE",
            txHash: body.txHash,
            assetName: body.assetName,
            profileId: body.profileId,
            name: body.name,
            image: body.image,
            standard: body.standard,
            properties: body.properties,
            metadata: body.metadata,
        });
        return { ok: true };
    }
    async revokeConfirm(body) {
        if (!body.txHash || !body.assetName || body.profileId == null) {
            throw new common_1.BadRequestException("Thiếu txHash, assetName hoặc profileId");
        }
        await this.trace.recordTx({
            action: "REVOKE",
            txHash: body.txHash,
            assetName: body.assetName,
            profileId: body.profileId,
        });
        return { ok: true };
    }
    async submit(body) {
        var _a;
        const raw = (_a = body.signedTxBase64) !== null && _a !== void 0 ? _a : body.signedTx;
        if (!raw || typeof raw !== "string") {
            throw new common_1.BadRequestException("Thiếu signedTx hoặc signedTxBase64");
        }
        return this.trace.submitSignedTx(raw, !!body.signedTxBase64);
    }
};
exports.TraceController = TraceController;
__decorate([
    (0, common_1.Get)("batches"),
    __param(0, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "listBatches", null);
__decorate([
    (0, common_1.Post)("mint"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.MintTraceDto]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "mint", null);
__decorate([
    (0, common_1.Post)("update"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.UpdateTraceDto]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "update", null);
__decorate([
    (0, common_1.Post)("revoke"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.RevokeTraceDto]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "revoke", null);
__decorate([
    (0, common_1.Post)("mint/confirm"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.MintConfirmDto]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "mintConfirm", null);
__decorate([
    (0, common_1.Post)("update/confirm"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.UpdateConfirmDto]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "updateConfirm", null);
__decorate([
    (0, common_1.Post)("revoke/confirm"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.RevokeConfirmDto]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "revokeConfirm", null);
__decorate([
    (0, common_1.Post)("submit"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.SubmitTxDto]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "submit", null);
exports.TraceController = TraceController = __decorate([
    (0, common_1.Controller)("trace"),
    __metadata("design:paramtypes", [trace_service_1.TraceService,
        auth_service_1.AuthService])
], TraceController);
//# sourceMappingURL=trace.controller.js.map