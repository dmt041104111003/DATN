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
const warehouse_storage_service_1 = require("./warehouse-storage.service");
const create_warehouse_storage_dto_1 = require("./dto/create-warehouse-storage.dto");
const update_warehouse_storage_dto_1 = require("./dto/update-warehouse-storage.dto");
const public_decorator_1 = require("../auth/public.decorator");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let WarehouseStorageController = class WarehouseStorageController {
    warehouseStorageService;
    constructor(warehouseStorageService) {
        this.warehouseStorageService = warehouseStorageService;
    }
    findAll() {
        return this.warehouseStorageService.findAll();
    }
    findOne(id) {
        return this.warehouseStorageService.findOne(id);
    }
    create(user, dto) {
        return this.warehouseStorageService.create(user.id, dto);
    }
    update(user, id, dto) {
        return this.warehouseStorageService.update(id, user.id, dto);
    }
    remove(user, id) {
        return this.warehouseStorageService.remove(id, user.id);
    }
};
exports.WarehouseStorageController = WarehouseStorageController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WarehouseStorageController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WarehouseStorageController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_warehouse_storage_dto_1.CreateWarehouseStorageDto]),
    __metadata("design:returntype", void 0)
], WarehouseStorageController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_warehouse_storage_dto_1.UpdateWarehouseStorageDto]),
    __metadata("design:returntype", void 0)
], WarehouseStorageController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WarehouseStorageController.prototype, "remove", null);
exports.WarehouseStorageController = WarehouseStorageController = __decorate([
    (0, common_1.Controller)('warehouse-storages'),
    __metadata("design:paramtypes", [warehouse_storage_service_1.WarehouseStorageService])
], WarehouseStorageController);
//# sourceMappingURL=warehouse-storage.controller.js.map