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
exports.WarehouseStorageController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const warehouse_storage_service_1 = require("./warehouse-storage.service");
let WarehouseStorageController = class WarehouseStorageController {
    constructor(warehouseStorageService) {
        this.warehouseStorageService = warehouseStorageService;
    }
    getCustodian(req) {
        const custodian = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
        if (!custodian) {
            throw new common_1.HttpException('Unable to determine account identity from session.', common_1.HttpStatus.UNAUTHORIZED);
        }
        return custodian;
    }
    getRole(req) {
        return String(req?.user?.role || req?.user?.roleCode || '').trim();
    }
    async list(req) {
        return this.warehouseStorageService.list(this.getCustodian(req));
    }
    async create(req, body) {
        try {
            return await this.warehouseStorageService.create(this.getCustodian(req), body);
        }
        catch (e) {
            throw new common_1.HttpException(e instanceof Error ? e.message : 'Failed to create warehouse storage.', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async update(req, id, body) {
        try {
            return await this.warehouseStorageService.update(this.getCustodian(req), id, body);
        }
        catch (e) {
            throw new common_1.HttpException(e instanceof Error ? e.message : 'Failed to update warehouse storage.', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async remove(req, id, body) {
        try {
            return await this.warehouseStorageService.remove(this.getCustodian(req), this.getRole(req), id, body);
        }
        catch (e) {
            throw new common_1.HttpException(e instanceof Error ? e.message : 'Failed to delete warehouse storage.', common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.WarehouseStorageController = WarehouseStorageController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WarehouseStorageController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WarehouseStorageController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WarehouseStorageController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WarehouseStorageController.prototype, "remove", null);
exports.WarehouseStorageController = WarehouseStorageController = __decorate([
    (0, common_1.Controller)('warehouse-storage'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [warehouse_storage_service_1.WarehouseStorageService])
], WarehouseStorageController);
//# sourceMappingURL=warehouse-storage.controller.js.map