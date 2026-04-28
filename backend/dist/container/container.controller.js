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
exports.ContainerController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const container_service_1 = require("./container.service");
let ContainerController = class ContainerController {
    constructor(containerService) {
        this.containerService = containerService;
    }
    getCustodian(req) {
        const custodian = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
        if (!custodian) {
            throw new common_1.HttpException('Unable to determine account identity from session.', common_1.HttpStatus.UNAUTHORIZED);
        }
        return custodian;
    }
    getRole(req) {
        return String(req?.user?.role || '').trim();
    }
    async list(req) {
        return this.containerService.list(this.getCustodian(req));
    }
    async capacitySummary(_req, productionInventoryKey, excludeContainerInventoryKey) {
        try {
            return await this.containerService.getCapacitySummary(productionInventoryKey, excludeContainerInventoryKey);
        }
        catch (e) {
            throw new common_1.HttpException(e instanceof Error ? e.message : 'Failed to calculate remaining capacity.', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async create(req, body) {
        try {
            return await this.containerService.create(this.getCustodian(req), body);
        }
        catch (e) {
            throw new common_1.HttpException(e instanceof Error ? e.message : 'Failed to register container.', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async update(req, inventoryKey, body) {
        try {
            return await this.containerService.update(this.getCustodian(req), inventoryKey, body);
        }
        catch (e) {
            throw new common_1.HttpException(e instanceof Error ? e.message : 'Failed to update container.', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async remove(req, inventoryKey, body) {
        try {
            return await this.containerService.deleteByInventoryKey(this.getCustodian(req), this.getRole(req), inventoryKey, body?.txHash);
        }
        catch (e) {
            throw new common_1.HttpException(e instanceof Error ? e.message : 'Failed to delete container.', common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.ContainerController = ContainerController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContainerController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('capacity/summary'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('productionInventoryKey')),
    __param(2, (0, common_1.Query)('excludeContainerInventoryKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ContainerController.prototype, "capacitySummary", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContainerController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':inventoryKey'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('inventoryKey')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ContainerController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':inventoryKey'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('inventoryKey')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ContainerController.prototype, "remove", null);
exports.ContainerController = ContainerController = __decorate([
    (0, common_1.Controller)('container'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [container_service_1.ContainerService])
], ContainerController);
//# sourceMappingURL=container.controller.js.map