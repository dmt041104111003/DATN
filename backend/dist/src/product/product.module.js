"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModule = void 0;
const common_1 = require("@nestjs/common");
const cardano_module_1 = require("../core/cardano/cardano.module");
const auth_module_1 = require("../auth/auth.module");
const warehouse_module_1 = require("../warehouse/warehouse.module");
const product_service_1 = require("./product.service");
const product_controller_1 = require("./product.controller");
const product_repository_1 = require("./domain/product.repository");
const prisma_product_repository_1 = require("./infra/prisma-product.repository");
const list_batches_use_case_1 = require("./application/use-cases/list-batches.use-case");
const record_product_tx_use_case_1 = require("./application/use-cases/record-product-tx.use-case");
const list_roadmap_use_case_1 = require("./application/use-cases/list-roadmap.use-case");
let ProductModule = class ProductModule {
};
exports.ProductModule = ProductModule;
exports.ProductModule = ProductModule = __decorate([
    (0, common_1.Module)({
        imports: [cardano_module_1.CardanoModule, auth_module_1.AuthModule, warehouse_module_1.WarehouseModule],
        controllers: [product_controller_1.ProductController],
        providers: [
            product_service_1.ProductService,
            {
                provide: product_repository_1.PRODUCT_REPOSITORY,
                useClass: prisma_product_repository_1.PrismaProductRepository,
            },
            list_batches_use_case_1.ListBatchesUseCase,
            record_product_tx_use_case_1.RecordProductTxUseCase,
            list_roadmap_use_case_1.ListRoadmapUseCase,
        ],
        exports: [product_service_1.ProductService],
    })
], ProductModule);
//# sourceMappingURL=product.module.js.map