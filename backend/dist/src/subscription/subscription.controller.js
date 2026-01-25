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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("./subscription.service");
const decorators_1 = require("../auth/decorators");
const pay_dto_1 = require("./dto/pay.dto");
let SubscriptionController = class SubscriptionController {
    subscriptionService;
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    findAll(user) {
        return this.subscriptionService.findAllByUser(user.id);
    }
    pay(user, dto) {
        return this.subscriptionService.pay(user.id, dto);
    }
    cancel(user, id) {
        return this.subscriptionService.cancel(id, user.id);
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('pay'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pay_dto_1.PayDto]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "pay", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "cancel", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, common_1.Controller)('subscriptions'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
//# sourceMappingURL=subscription.controller.js.map