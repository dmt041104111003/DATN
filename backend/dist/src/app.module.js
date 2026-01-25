"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma.module");
const user_module_1 = require("./user/user.module");
const product_module_1 = require("./product/product.module");
const collection_module_1 = require("./collection/collection.module");
const production_process_module_1 = require("./production-process/production-process.module");
const certification_module_1 = require("./certification/certification.module");
const material_module_1 = require("./material/material.module");
const supplier_module_1 = require("./supplier/supplier.module");
const warehouse_module_1 = require("./warehouse/warehouse.module");
const warehouse_storage_module_1 = require("./warehouse-storage/warehouse-storage.module");
const service_module_1 = require("./service/service.module");
const subscription_module_1 = require("./subscription/subscription.module");
const auth_module_1 = require("./auth/auth.module");
const blockchain_module_1 = require("./blockchain/blockchain.module");
const contract_module_1 = require("./contract/contract.module");
const ipfs_module_1 = require("./ipfs/ipfs.module");
const media_module_1 = require("./media/media.module");
const metadata_module_1 = require("./metadata/metadata.module");
const document_module_1 = require("./document/document.module");
const product_material_module_1 = require("./product-material/product-material.module");
const redis_module_1 = require("./redis/redis.module");
const core_1 = require("@nestjs/core");
const guards_1 = require("./auth/guards");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            ipfs_module_1.IpfsModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            product_module_1.ProductModule,
            product_material_module_1.ProductMaterialModule,
            collection_module_1.CollectionModule,
            metadata_module_1.MetadataModule,
            media_module_1.MediaModule,
            document_module_1.DocumentModule,
            production_process_module_1.ProductionProcessModule,
            certification_module_1.CertificationModule,
            material_module_1.MaterialModule,
            supplier_module_1.SupplierModule,
            warehouse_module_1.WarehouseModule,
            warehouse_storage_module_1.WarehouseStorageModule,
            service_module_1.ServiceModule,
            subscription_module_1.SubscriptionModule,
            blockchain_module_1.BlockchainModule,
            contract_module_1.ContractModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: guards_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map