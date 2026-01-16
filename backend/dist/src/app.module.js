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
const feedback_module_1 = require("./feedback/feedback.module");
const payment_module_1 = require("./payment/payment.module");
const warehouse_module_1 = require("./warehouse/warehouse.module");
const warehouse_storage_module_1 = require("./warehouse-storage/warehouse-storage.module");
const service_module_1 = require("./service/service.module");
const subscription_module_1 = require("./subscription/subscription.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            user_module_1.UserModule, prisma_module_1.PrismaModule,
            product_module_1.ProductModule,
            collection_module_1.CollectionModule,
            production_process_module_1.ProductionProcessModule,
            certification_module_1.CertificationModule,
            material_module_1.MaterialModule,
            warehouse_module_1.WarehouseModule,
            warehouse_storage_module_1.WarehouseStorageModule,
            feedback_module_1.FeedbackModule,
            service_module_1.ServiceModule,
            payment_module_1.PaymentModule,
            subscription_module_1.SubscriptionModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map