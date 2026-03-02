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
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const product_service_1 = require("./product.service");
const auth_service_1 = require("../auth/auth.service");
const product_dto_1 = require("./dto/product.dto");
const ENTERPRISE_ROLE = "ENTERPRISE";
let ProductController = class ProductController {
    constructor(product, auth) {
        this.product = product;
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
        const items = await this.product.listBatches(profileId);
        return { total: items.length, items };
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
        return this.product.mint({
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
        return this.product.update({
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
            certUnit: body.certUnit,
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
        return this.product.revoke({
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
        return this.product.burn({
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
        await this.product.recordTx({
            action: "MINT",
            txHash: body.txHash,
            assetName: body.assetName,
            profileId: body.minterProfileId,
            name: body.name,
            description: body.description,
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
        await this.product.recordTx({
            action: "UPDATE",
            txHash: body.txHash,
            assetName: body.assetName,
            profileId: body.profileId,
            name: body.name,
            description: body.description,
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
        await this.product.recordTx({
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
        await this.product.recordTx({
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
        return this.product.submitSignedTx(raw, !!body.signedTxBase64);
    }
    async getRoadmap(code, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if ((role !== null && role !== void 0 ? role : "").toUpperCase() !== ENTERPRISE_ROLE) {
            throw new common_1.ForbiddenException("Only ENTERPRISE can read product roadmap.");
        }
        if (!code || typeof code !== "string" || !code.trim()) {
            return { items: [] };
        }
        const items = await this.product.listRoadmap(code.trim());
        return { items };
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_1.Get)("batches"),
    __param(0, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "listBatches", null);
__decorate([
    (0, common_1.Post)("mint"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.MintProductDto, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "mint", null);
__decorate([
    (0, common_1.Post)("update"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.UpdateProductDto, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "update", null);
__decorate([
    (0, common_1.Post)("revoke"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.RevokeProductDto, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "revoke", null);
__decorate([
    (0, common_1.Post)("burn"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.BurnProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "burn", null);
__decorate([
    (0, common_1.Post)("mint/confirm"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.MintConfirmDto, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "mintConfirm", null);
__decorate([
    (0, common_1.Post)("update/confirm"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.UpdateConfirmDto, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateConfirm", null);
__decorate([
    (0, common_1.Post)("revoke/confirm"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.RevokeConfirmDto, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "revokeConfirm", null);
__decorate([
    (0, common_1.Post)("burn/confirm"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.BurnConfirmDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "burnConfirm", null);
__decorate([
    (0, common_1.Post)("submit"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.SubmitTxDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)("roadmap"),
    __param(0, (0, common_1.Query)("code")),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getRoadmap", null);
exports.ProductController = ProductController = __decorate([
    (0, common_1.Controller)("product"),
    __metadata("design:paramtypes", [product_service_1.ProductService,
        auth_service_1.AuthService])
], ProductController);
//# sourceMappingURL=product.controller.js.map