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
exports.WarehouseService = void 0;
const common_1 = require("@nestjs/common");
const warehouse_repository_1 = require("./domain/warehouse.repository");
const list_my_inventory_use_case_1 = require("./application/use-cases/list-my-inventory.use-case");
const remove_item_use_case_1 = require("./application/use-cases/remove-item.use-case");
const mark_shipped_use_case_1 = require("./application/use-cases/mark-shipped.use-case");
const mark_burned_use_case_1 = require("./application/use-cases/mark-burned.use-case");
const add_to_warehouse_use_case_1 = require("./application/use-cases/add-to-warehouse.use-case");
const get_recipient_by_roadmap_use_case_1 = require("./application/use-cases/get-recipient-by-roadmap.use-case");
let WarehouseService = class WarehouseService {
    constructor(repository, listMyInventoryUseCase, removeItemUseCase, markShippedUseCase, markBurnedUseCase, addToWarehouseUseCase, getRecipientByRoadmapUseCase) {
        this.repository = repository;
        this.listMyInventoryUseCase = listMyInventoryUseCase;
        this.removeItemUseCase = removeItemUseCase;
        this.markShippedUseCase = markShippedUseCase;
        this.markBurnedUseCase = markBurnedUseCase;
        this.addToWarehouseUseCase = addToWarehouseUseCase;
        this.getRecipientByRoadmapUseCase = getRecipientByRoadmapUseCase;
    }
    async listMyWarehouseInventory(profileId) {
        return this.listMyInventoryUseCase.execute(profileId);
    }
    async removeOneFromWarehouse(profileId, batchId) {
        return this.removeItemUseCase.execute(profileId, batchId);
    }
    async markAsShipped(profileId, batchId) {
        return this.markShippedUseCase.execute(profileId, batchId);
    }
    async markAsBurned(profileId, batchId) {
        return this.markBurnedUseCase.execute(profileId, batchId);
    }
    async addToWarehouse(profileId, batchId) {
        return this.addToWarehouseUseCase.execute(profileId, batchId);
    }
    async getRecipientByRoadmap(profileId, batchId) {
        return this.getRecipientByRoadmapUseCase.execute(profileId, batchId);
    }
};
exports.WarehouseService = WarehouseService;
exports.WarehouseService = WarehouseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(warehouse_repository_1.WAREHOUSE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, list_my_inventory_use_case_1.ListMyInventoryUseCase,
        remove_item_use_case_1.RemoveItemUseCase,
        mark_shipped_use_case_1.MarkShippedUseCase,
        mark_burned_use_case_1.MarkBurnedUseCase,
        add_to_warehouse_use_case_1.AddToWarehouseUseCase,
        get_recipient_by_roadmap_use_case_1.GetRecipientByRoadmapUseCase])
], WarehouseService);
//# sourceMappingURL=warehouse.service.js.map