"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../core/config/config.module");
const prisma_module_1 = require("../prisma/prisma.module");
const product_module_1 = require("../product/product.module");
const auth_module_1 = require("../auth/auth.module");
const order_service_1 = require("./order.service");
const order_controller_1 = require("./order.controller");
const order_repository_1 = require("./domain/order.repository");
const prisma_order_repository_1 = require("./infra/prisma-order.repository");
const list_orders_for_profile_use_case_1 = require("./application/use-cases/list-orders-for-profile.use-case");
const save_partial_signed_tx_use_case_1 = require("./application/use-cases/save-partial-signed-tx.use-case");
const record_order_use_case_1 = require("./application/use-cases/record-order.use-case");
const confirm_order_complete_use_case_1 = require("./application/use-cases/confirm-order-complete.use-case");
let OrderModule = class OrderModule {
};
exports.OrderModule = OrderModule;
exports.OrderModule = OrderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            prisma_module_1.PrismaModule,
            (0, common_1.forwardRef)(() => product_module_1.ProductModule),
            auth_module_1.AuthModule,
        ],
        controllers: [order_controller_1.OrderController],
        providers: [
            order_service_1.OrderService,
            {
                provide: order_repository_1.ORDER_REPOSITORY,
                useClass: prisma_order_repository_1.PrismaOrderRepository,
            },
            list_orders_for_profile_use_case_1.ListOrdersForProfileUseCase,
            save_partial_signed_tx_use_case_1.SavePartialSignedTxUseCase,
            record_order_use_case_1.RecordOrderUseCase,
            confirm_order_complete_use_case_1.ConfirmOrderCompleteUseCase,
        ],
        exports: [order_service_1.OrderService],
    })
], OrderModule);
//# sourceMappingURL=order.module.js.map