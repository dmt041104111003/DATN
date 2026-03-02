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
const config_module_1 = require("./core/config/config.module");
const prisma_module_1 = require("./prisma/prisma.module");
const cardano_module_1 = require("./core/cardano/cardano.module");
const product_module_1 = require("./product/product.module");
const auth_module_1 = require("./auth/auth.module");
const profile_module_1 = require("./profile/profile.module");
const order_module_1 = require("./order/order.module");
const warehouse_module_1 = require("./warehouse/warehouse.module");
const certificate_module_1 = require("./certificate/certificate.module");
const ipfs_module_1 = require("./ipfs/ipfs.module");
const upload_module_1 = require("./upload/upload.module");
const trace_module_1 = require("./trace/trace.module");
const health_module_1 = require("./health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            prisma_module_1.PrismaModule,
            cardano_module_1.CardanoModule,
            product_module_1.ProductModule,
            auth_module_1.AuthModule,
            profile_module_1.ProfileModule,
            order_module_1.OrderModule,
            warehouse_module_1.WarehouseModule,
            certificate_module_1.CertificateModule,
            ipfs_module_1.IpfsModule,
            upload_module_1.UploadModule,
            trace_module_1.TraceModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map