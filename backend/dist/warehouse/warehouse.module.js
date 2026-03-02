"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const prisma_module_1 = require("../prisma/prisma.module");
const warehouse_controller_1 = require("./warehouse.controller");
const warehouse_service_1 = require("./warehouse.service");
const warehouse_repository_1 = require("./domain/warehouse.repository");
const prisma_warehouse_repository_1 = require("./infra/prisma-warehouse.repository");
const list_my_inventory_use_case_1 = require("./application/use-cases/list-my-inventory.use-case");
const remove_item_use_case_1 = require("./application/use-cases/remove-item.use-case");
const mark_shipped_use_case_1 = require("./application/use-cases/mark-shipped.use-case");
const mark_burned_use_case_1 = require("./application/use-cases/mark-burned.use-case");
const add_to_warehouse_use_case_1 = require("./application/use-cases/add-to-warehouse.use-case");
const get_recipient_by_roadmap_use_case_1 = require("./application/use-cases/get-recipient-by-roadmap.use-case");
let WarehouseModule = class WarehouseModule {
};
exports.WarehouseModule = WarehouseModule;
exports.WarehouseModule = WarehouseModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, prisma_module_1.PrismaModule],
        controllers: [warehouse_controller_1.WarehouseController],
        providers: [
            warehouse_service_1.WarehouseService,
            {
                provide: warehouse_repository_1.WAREHOUSE_REPOSITORY,
                useClass: prisma_warehouse_repository_1.PrismaWarehouseRepository,
            },
            list_my_inventory_use_case_1.ListMyInventoryUseCase,
            remove_item_use_case_1.RemoveItemUseCase,
            mark_shipped_use_case_1.MarkShippedUseCase,
            mark_burned_use_case_1.MarkBurnedUseCase,
            add_to_warehouse_use_case_1.AddToWarehouseUseCase,
            get_recipient_by_roadmap_use_case_1.GetRecipientByRoadmapUseCase,
        ],
        exports: [warehouse_service_1.WarehouseService],
    })
], WarehouseModule);
//# sourceMappingURL=warehouse.module.js.map