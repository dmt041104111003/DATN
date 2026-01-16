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
exports.ProductMaterialController = void 0;
const common_1 = require("@nestjs/common");
const product_material_service_1 = require("./product-material.service");
const create_product_material_dto_1 = require("./dto/create-product-material.dto");
const update_product_material_dto_1 = require("./dto/update-product-material.dto");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let ProductMaterialController = class ProductMaterialController {
    service;
    constructor(service) {
        this.service = service;
    }
    findByProduct(user, productId) {
        return this.service.findByProduct(productId, user.id);
    }
    findOne(user, id) {
        return this.service.findOne(id, user.id);
    }
    create(user, dto) {
        return this.service.create(user.id, dto);
    }
    update(user, id, dto) {
        return this.service.update(id, user.id, dto);
    }
    remove(user, id) {
        return this.service.remove(id, user.id);
    }
};
exports.ProductMaterialController = ProductMaterialController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProductMaterialController.prototype, "findByProduct", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProductMaterialController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_product_material_dto_1.CreateProductMaterialDto]),
    __metadata("design:returntype", void 0)
], ProductMaterialController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_product_material_dto_1.UpdateProductMaterialDto]),
    __metadata("design:returntype", void 0)
], ProductMaterialController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProductMaterialController.prototype, "remove", null);
exports.ProductMaterialController = ProductMaterialController = __decorate([
    (0, common_1.Controller)('product-materials'),
    __metadata("design:paramtypes", [product_material_service_1.ProductMaterialService])
], ProductMaterialController);
//# sourceMappingURL=product-material.controller.js.map