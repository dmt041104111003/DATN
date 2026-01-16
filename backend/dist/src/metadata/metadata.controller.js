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
exports.MetadataController = void 0;
const common_1 = require("@nestjs/common");
const metadata_service_1 = require("./metadata.service");
const create_metadata_dto_1 = require("./dto/create-metadata.dto");
const update_metadata_dto_1 = require("./dto/update-metadata.dto");
const public_decorator_1 = require("../auth/public.decorator");
let MetadataController = class MetadataController {
    metadataService;
    constructor(metadataService) {
        this.metadataService = metadataService;
    }
    findAll() {
        return this.metadataService.findAll();
    }
    findOne(id) {
        return this.metadataService.findOne(id);
    }
    create(dto) {
        return this.metadataService.create(dto);
    }
    update(id, dto) {
        return this.metadataService.update(id, dto);
    }
    remove(id) {
        return this.metadataService.remove(id);
    }
};
exports.MetadataController = MetadataController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetadataController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MetadataController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_metadata_dto_1.CreateMetadataDto]),
    __metadata("design:returntype", void 0)
], MetadataController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_metadata_dto_1.UpdateMetadataDto]),
    __metadata("design:returntype", void 0)
], MetadataController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MetadataController.prototype, "remove", null);
exports.MetadataController = MetadataController = __decorate([
    (0, common_1.Controller)('metadata'),
    __metadata("design:paramtypes", [metadata_service_1.MetadataService])
], MetadataController);
//# sourceMappingURL=metadata.controller.js.map