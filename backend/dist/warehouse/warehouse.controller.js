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
exports.WarehouseController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth/auth.service");
const warehouse_service_1 = require("./warehouse.service");
const warehouse_dto_1 = require("./dto/warehouse.dto");
const WAREHOUSE_ROLES = ["ENTERPRISE", "TRANSIT", "AGENT"];
let WarehouseController = class WarehouseController {
    constructor(warehouse, auth) {
        this.warehouse = warehouse;
        this.auth = auth;
    }
    async getMyWarehouse(token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if (!WAREHOUSE_ROLES.includes((role !== null && role !== void 0 ? role : "").toUpperCase())) {
            throw new common_1.ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can access warehouse.");
        }
        const items = await this.warehouse.listMyWarehouseInventory(profileId);
        return { items };
    }
    async removeItem(body, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if (!WAREHOUSE_ROLES.includes((role !== null && role !== void 0 ? role : "").toUpperCase())) {
            throw new common_1.ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can remove item from warehouse.");
        }
        if (!body.batchId || typeof body.batchId !== "string" || !body.batchId.trim()) {
            throw new common_1.BadRequestException("batchId is required.");
        }
        await this.warehouse.removeOneFromWarehouse(profileId, body.batchId.trim());
        return { ok: true };
    }
    async markShipped(body, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if (!WAREHOUSE_ROLES.includes((role !== null && role !== void 0 ? role : "").toUpperCase())) {
            throw new common_1.ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can mark item as shipped.");
        }
        if (!body.batchId || typeof body.batchId !== "string" || !body.batchId.trim()) {
            throw new common_1.BadRequestException("batchId is required.");
        }
        await this.warehouse.markAsShipped(profileId, body.batchId.trim());
        return { ok: true };
    }
    async getRecipientByRoadmap(batchId, token) {
        if (!token || typeof token !== "string" || !token.trim()) {
            throw new common_1.UnauthorizedException("Missing or invalid token.");
        }
        const profileId = await this.auth.getProfileIdFromToken(token.trim());
        const role = await this.auth.getProfileRoleFromToken(token.trim());
        if (!WAREHOUSE_ROLES.includes((role !== null && role !== void 0 ? role : "").toUpperCase())) {
            throw new common_1.ForbiddenException("Only ENTERPRISE, TRANSIT and AGENT can use recipient-by-roadmap.");
        }
        if (!batchId || typeof batchId !== "string" || !batchId.trim()) {
            return { recipientAddress: null };
        }
        return this.warehouse.getRecipientByRoadmap(profileId, batchId.trim());
    }
};
exports.WarehouseController = WarehouseController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "getMyWarehouse", null);
__decorate([
    (0, common_1.Post)("remove-item"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [warehouse_dto_1.WarehouseBatchIdDto, String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Post)("mark-shipped"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [warehouse_dto_1.WarehouseBatchIdDto, String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "markShipped", null);
__decorate([
    (0, common_1.Get)("recipient-by-roadmap"),
    __param(0, (0, common_1.Query)("batchId")),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "getRecipientByRoadmap", null);
exports.WarehouseController = WarehouseController = __decorate([
    (0, common_1.Controller)("warehouse"),
    __metadata("design:paramtypes", [warehouse_service_1.WarehouseService,
        auth_service_1.AuthService])
], WarehouseController);
//# sourceMappingURL=warehouse.controller.js.map