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
exports.CollectionController = void 0;
const common_1 = require("@nestjs/common");
const collection_service_1 = require("./collection.service");
const create_collection_dto_1 = require("./dto/create-collection.dto");
const update_collection_dto_1 = require("./dto/update-collection.dto");
const public_decorator_1 = require("../auth/public.decorator");
let CollectionController = class CollectionController {
    collectionService;
    constructor(collectionService) {
        this.collectionService = collectionService;
    }
    findAll() {
        return this.collectionService.findAll();
    }
    findOne(id) {
        return this.collectionService.findOne(id);
    }
    create(dto) {
        return this.collectionService.create(dto);
    }
    update(id, dto) {
        return this.collectionService.update(id, dto);
    }
    remove(id) {
        return this.collectionService.remove(id);
    }
};
exports.CollectionController = CollectionController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CollectionController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CollectionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_collection_dto_1.CreateCollectionDto]),
    __metadata("design:returntype", void 0)
], CollectionController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_collection_dto_1.UpdateCollectionDto]),
    __metadata("design:returntype", void 0)
], CollectionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CollectionController.prototype, "remove", null);
exports.CollectionController = CollectionController = __decorate([
    (0, common_1.Controller)('collections'),
    __metadata("design:paramtypes", [collection_service_1.CollectionService])
], CollectionController);
//# sourceMappingURL=collection.controller.js.map