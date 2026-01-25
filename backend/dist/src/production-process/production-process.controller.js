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
exports.ProductionProcessController = void 0;
const common_1 = require("@nestjs/common");
const production_process_service_1 = require("./production-process.service");
const create_production_process_dto_1 = require("./dto/create-production-process.dto");
const update_production_process_dto_1 = require("./dto/update-production-process.dto");
const decorators_1 = require("../auth/decorators");
let ProductionProcessController = class ProductionProcessController {
    productionProcessService;
    constructor(productionProcessService) {
        this.productionProcessService = productionProcessService;
    }
    findAll() {
        return this.productionProcessService.findAll();
    }
    findOne(id) {
        return this.productionProcessService.findOne(id);
    }
    create(user, dto) {
        return this.productionProcessService.create(user.id, dto);
    }
    update(user, id, dto) {
        return this.productionProcessService.update(id, user.id, dto);
    }
    remove(user, id) {
        return this.productionProcessService.remove(id, user.id);
    }
};
exports.ProductionProcessController = ProductionProcessController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductionProcessController.prototype, "findAll", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductionProcessController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_production_process_dto_1.CreateProductionProcessDto]),
    __metadata("design:returntype", void 0)
], ProductionProcessController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_production_process_dto_1.UpdateProductionProcessDto]),
    __metadata("design:returntype", void 0)
], ProductionProcessController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProductionProcessController.prototype, "remove", null);
exports.ProductionProcessController = ProductionProcessController = __decorate([
    (0, common_1.Controller)('production-processes'),
    __metadata("design:paramtypes", [production_process_service_1.ProductionProcessService])
], ProductionProcessController);
//# sourceMappingURL=production-process.controller.js.map