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
const config_1 = require("@nestjs/config");
const auth_controller_1 = require("./auth/auth.controller");
const auth_service_1 = require("./auth/auth.service");
const prisma_service_1 = require("./prisma/prisma.service");
const profile_controller_1 = require("./profile/profile.controller");
const profile_service_1 = require("./profile/profile.service");
const jwt_strategy_1 = require("./auth/jwt.strategy");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const schedule_1 = require("@nestjs/schedule");
const trace_controller_1 = require("./trace/trace.controller");
const trace_service_1 = require("./trace/trace.service");
const media_controller_1 = require("./media/media.controller");
const health_controller_1 = require("./health/health.controller");
const record_operation_controller_1 = require("./record-operation/record-operation.controller");
const record_operation_verifier_service_1 = require("./record-operation/record-operation.verifier.service");
const production_controller_1 = require("./production/production.controller");
const production_service_1 = require("./production/production.service");
const contract_controller_1 = require("./contract/contract.controller");
const contract_service_1 = require("./contract/contract.service");
const container_controller_1 = require("./container/container.controller");
const container_service_1 = require("./container/container.service");
const location_controller_1 = require("./location/location.controller");
const warehouse_controller_1 = require("./warehouse/warehouse.controller");
const warehouse_service_1 = require("./warehouse/warehouse.service");
const warehouse_storage_controller_1 = require("./warehouse-storage/warehouse-storage.controller");
const warehouse_storage_service_1 = require("./warehouse-storage/warehouse-storage.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            schedule_1.ScheduleModule.forRoot(),
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '7d' },
            }),
        ],
        controllers: [
            auth_controller_1.AuthController,
            profile_controller_1.ProfileController,
            trace_controller_1.TraceController,
            media_controller_1.MediaController,
            record_operation_controller_1.RecordOperationController,
            production_controller_1.ProductionController,
            contract_controller_1.ContractController,
            container_controller_1.ContainerController,
            warehouse_controller_1.WarehouseController,
            warehouse_storage_controller_1.WarehouseStorageController,
            health_controller_1.HealthController,
            location_controller_1.LocationController,
        ],
        providers: [
            auth_service_1.AuthService,
            prisma_service_1.PrismaService,
            profile_service_1.ProfileService,
            jwt_strategy_1.JwtStrategy,
            trace_service_1.TraceService,
            record_operation_verifier_service_1.RecordOperationVerifierService,
            production_service_1.ProductionService,
            contract_service_1.ContractService,
            container_service_1.ContainerService,
            warehouse_service_1.WarehouseService,
            warehouse_storage_service_1.WarehouseStorageService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map