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
let TraceController = class TraceController {
    constructor(trace) {
        this.trace = trace;
    }
    async listByPolicy(policyId) {
        if (!/^[a-fA-F0-9]{56}$/.test(policyId)) {
            throw new common_1.BadRequestException("policyId phải là 56 ký tự hex");
        }
        const assets = await this.trace.listAssetsByPolicy(policyId);
        return {
            policyId,
            total: assets.length,
            assets,
        };
    }
    buildMetadata(body) {
        if (!body.pk ||
            body.receivers === undefined ||
            !body.receiver_locations ||
            !body.receiver_coordinates ||
            !body.minter_location ||
            !body.minter_coordinates ||
            !body.name ||
            !body.image) {
            throw new common_1.BadRequestException("Thiếu: pk, receivers, receiver_locations, receiver_coordinates, minter_location, minter_coordinates, name, image");
        }
        return this.trace.buildMetadata(body);
    }
    async mint(body) {
        if (!body.changeAddress || !body.assetName || !body.metadata) {
            throw new common_1.BadRequestException("Thiếu changeAddress, assetName hoặc metadata");
        }
        return this.trace.mint(body);
    }
    async update(body) {
        if (!body.changeAddress || !body.assetName || !body.metadata) {
            throw new common_1.BadRequestException("Thiếu changeAddress, assetName hoặc metadata");
        }
        return this.trace.update(body);
    }
    async burn(body) {
        if (!body.changeAddress || !body.assetName) {
            throw new common_1.BadRequestException("Thiếu changeAddress hoặc assetName");
        }
        return this.trace.burn(body);
    }
    async revoke(body) {
        if (!body.changeAddress || !body.assetName) {
            throw new common_1.BadRequestException("Thiếu changeAddress hoặc assetName");
        }
        return this.trace.revoke(body);
    }
    async submit(body) {
        if (!body.signedTx) {
            throw new common_1.BadRequestException("Thiếu signedTx (hex CBOR đã ký)");
        }
        return this.trace.submitSignedTx(body.signedTx);
    }
};
exports.TraceController = TraceController;
__decorate([
    (0, common_1.Get)("policy/:policyId"),
    __param(0, (0, common_1.Param)("policyId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "listByPolicy", null);
__decorate([
    (0, common_1.Post)("metadata/build"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], TraceController.prototype, "buildMetadata", null);
__decorate([
    (0, common_1.Post)("mint"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "mint", null);
__decorate([
    (0, common_1.Post)("update"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "update", null);
__decorate([
    (0, common_1.Post)("burn"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "burn", null);
__decorate([
    (0, common_1.Post)("revoke"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "revoke", null);
__decorate([
    (0, common_1.Post)("submit"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "submit", null);
exports.TraceController = TraceController = __decorate([
    (0, common_1.Controller)("trace"),
    __metadata("design:paramtypes", [trace_service_1.TraceService])
], TraceController);
//# sourceMappingURL=trace.controller.js.map