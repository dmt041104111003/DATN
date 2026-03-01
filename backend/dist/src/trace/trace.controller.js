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
const ENTERPRISE_ROLE = "ENTERPRISE";
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
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can list product batches (minted ref100).");
        }
        const items = await this.trace.listBatches(profileId);
        return { total: items.length, items };
    }
    async getMyWarehouse(token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        const allowed = ["ENTERPRISE", "TRANSIT", "AGENT"].includes((role !== null && role !== void 0 ? role : "").toUpperCase());
        if (!allowed) {
            throw new common_1.ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can access warehouse.");
        }
        const items = await this.trace.listMyWarehouseInventory(profileId);
        return { items };
    }
    async getLockRecipientByRoadmap(batchId, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        const allowed = ["ENTERPRISE", "TRANSIT", "AGENT"].includes((role !== null && role !== void 0 ? role : "").toUpperCase());
        if (!allowed) {
            throw new common_1.ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can use lock-recipient-by-roadmap.");
        }
        if (!batchId || typeof batchId !== "string" || !batchId.trim()) {
            return { recipientAddress: null };
        }
        return this.trace.getLockRecipientByRoadmap(profileId, batchId.trim());
    }
    async removeWarehouseItem(body, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        const allowed = ["ENTERPRISE", "TRANSIT", "AGENT"].includes((role !== null && role !== void 0 ? role : "").toUpperCase());
        if (!allowed) {
            throw new common_1.ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can remove item from warehouse.");
        }
        if (!body.batchId || typeof body.batchId !== "string" || !body.batchId.trim()) {
            throw new common_1.BadRequestException("batchId is required.");
        }
        await this.trace.removeOneFromWarehouse(profileId, body.batchId.trim());
        return { ok: true };
    }
    async markWarehouseItemShipped(body, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        const allowed = ["ENTERPRISE", "TRANSIT", "AGENT"].includes((role !== null && role !== void 0 ? role : "").toUpperCase());
        if (!allowed) {
            throw new common_1.ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can mark item as shipped.");
        }
        if (!body.batchId || typeof body.batchId !== "string" || !body.batchId.trim()) {
            throw new common_1.BadRequestException("batchId is required.");
        }
        await this.trace.markAsShipped(profileId, body.batchId.trim());
        return { ok: true };
    }
    async mint(body, token) {
        var _a;
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can mint (ProductBatch/ref100). Other roles can only burn NFT 222.");
        }
        if (!body.changeAddress || !body.assetName) {
            throw new common_1.BadRequestException("Missing changeAddress or assetName");
        }
        if (!body.metadata && (!body.name ||
            !body.image ||
            !((_a = body.receivers) === null || _a === void 0 ? void 0 : _a.length) ||
            !body.receiverLocations ||
            !body.receiverCoordinates ||
            !body.minterLocation ||
            !body.minterCoordinates)) {
            throw new common_1.BadRequestException("Missing metadata or (name, image, receivers, receiverLocations, receiverCoordinates, minterLocation, minterCoordinates)");
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
    async update(body, token) {
        var _a;
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can update (ProductBatch/ref100).");
        }
        if (!body.changeAddress || !body.assetName) {
            throw new common_1.BadRequestException("Missing changeAddress or assetName");
        }
        if (!body.metadata && (!body.name ||
            !body.image ||
            !((_a = body.receivers) === null || _a === void 0 ? void 0 : _a.length) ||
            !body.receiverLocations ||
            !body.receiverCoordinates ||
            !body.minterLocation ||
            !body.minterCoordinates)) {
            throw new common_1.BadRequestException("Missing metadata or (name, image, receivers, receiverLocations, receiverCoordinates, minterLocation, minterCoordinates)");
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
    async revoke(body, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can revoke (ProductBatch/ref100).");
        }
        if (!body.changeAddress || !body.assetName) {
            throw new common_1.BadRequestException("Missing changeAddress or assetName");
        }
        return this.trace.revoke({
            changeAddress: body.changeAddress,
            assetName: body.assetName,
            txHash: body.txHash,
            walletUtxos: body.walletUtxos,
            utxoAddresses: body.utxoAddresses,
        });
    }
    async burn(body) {
        if (!body.changeAddress || !body.assetName) {
            throw new common_1.BadRequestException("Missing changeAddress or assetName");
        }
        return this.trace.burn({
            changeAddress: body.changeAddress,
            assetName: body.assetName,
            txHash: body.txHash,
            policyId: body.policyId,
            walletUtxos: body.walletUtxos,
            utxoAddresses: body.utxoAddresses,
        });
    }
    async mintConfirm(body, token) {
        var _a;
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can confirm mint.");
        }
        if (!body.txHash || !body.assetName || !body.name || body.minterProfileId == null) {
            throw new common_1.BadRequestException("Missing txHash, assetName, name or minterProfileId");
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
            policyId: body.policyId,
            receivers: body.receivers,
        });
        return { ok: true };
    }
    async updateConfirm(body, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can confirm update.");
        }
        if (!body.txHash || !body.assetName || body.profileId == null) {
            throw new common_1.BadRequestException("Missing txHash, assetName or profileId");
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
            receivers: body.receivers,
        });
        return { ok: true };
    }
    async revokeConfirm(body, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can confirm revoke.");
        }
        if (!body.txHash || !body.assetName || body.profileId == null) {
            throw new common_1.BadRequestException("Missing txHash, assetName or profileId");
        }
        await this.trace.recordTx({
            action: "REVOKE",
            txHash: body.txHash,
            assetName: body.assetName,
            profileId: body.profileId,
            receivers: body.receivers,
        });
        return { ok: true };
    }
    async burnConfirm(body) {
        if (!body.txHash || !body.assetName || body.profileId == null) {
            throw new common_1.BadRequestException("Missing txHash, assetName or profileId");
        }
        await this.trace.recordTx({
            action: "BURN",
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
            throw new common_1.BadRequestException("Missing signedTx or signedTxBase64");
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
    (0, common_1.Get)("warehouses"),
    __param(0, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "getMyWarehouse", null);
__decorate([
    (0, common_1.Get)("lock-recipient-by-roadmap"),
    __param(0, (0, common_1.Query)("batchId")),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "getLockRecipientByRoadmap", null);
__decorate([
    (0, common_1.Post)("warehouses/remove-item"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.RemoveWarehouseItemDto, String]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "removeWarehouseItem", null);
__decorate([
    (0, common_1.Post)("warehouses/mark-shipped"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.RemoveWarehouseItemDto, String]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "markWarehouseItemShipped", null);
__decorate([
    (0, common_1.Post)("mint"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.MintTraceDto, String]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "mint", null);
__decorate([
    (0, common_1.Post)("update"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.UpdateTraceDto, String]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "update", null);
__decorate([
    (0, common_1.Post)("revoke"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.RevokeTraceDto, String]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "revoke", null);
__decorate([
    (0, common_1.Post)("burn"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.BurnTraceDto]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "burn", null);
__decorate([
    (0, common_1.Post)("mint/confirm"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.MintConfirmDto, String]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "mintConfirm", null);
__decorate([
    (0, common_1.Post)("update/confirm"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.UpdateConfirmDto, String]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "updateConfirm", null);
__decorate([
    (0, common_1.Post)("revoke/confirm"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.RevokeConfirmDto, String]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "revokeConfirm", null);
__decorate([
    (0, common_1.Post)("burn/confirm"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.BurnConfirmDto]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "burnConfirm", null);
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