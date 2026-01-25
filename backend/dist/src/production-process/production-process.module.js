"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionProcessModule = void 0;
const common_1 = require("@nestjs/common");
const production_process_controller_1 = require("./production-process.controller");
const production_process_service_1 = require("./production-process.service");
const prisma_module_1 = require("../prisma.module");
const redis_module_1 = require("../redis/redis.module");
const subscription_module_1 = require("../subscription/subscription.module");
let ProductionProcessModule = class ProductionProcessModule {
};
exports.ProductionProcessModule = ProductionProcessModule;
exports.ProductionProcessModule = ProductionProcessModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, redis_module_1.RedisModule, subscription_module_1.SubscriptionModule],
        controllers: [production_process_controller_1.ProductionProcessController],
        providers: [production_process_service_1.ProductionProcessService],
        exports: [production_process_service_1.ProductionProcessService],
    })
], ProductionProcessModule);
//# sourceMappingURL=production-process.module.js.map