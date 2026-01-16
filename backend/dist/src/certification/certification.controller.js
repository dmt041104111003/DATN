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
exports.CertificationController = void 0;
const common_1 = require("@nestjs/common");
const certification_service_1 = require("./certification.service");
const create_certification_dto_1 = require("./dto/create-certification.dto");
const update_certification_dto_1 = require("./dto/update-certification.dto");
const public_decorator_1 = require("../auth/public.decorator");
let CertificationController = class CertificationController {
    certificationService;
    constructor(certificationService) {
        this.certificationService = certificationService;
    }
    findAll() {
        return this.certificationService.findAll();
    }
    findOne(id) {
        return this.certificationService.findOne(id);
    }
    create(dto) {
        return this.certificationService.create(dto);
    }
    update(id, dto) {
        return this.certificationService.update(id, dto);
    }
    remove(id) {
        return this.certificationService.remove(id);
    }
};
exports.CertificationController = CertificationController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CertificationController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CertificationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_certification_dto_1.CreateCertificationDto]),
    __metadata("design:returntype", void 0)
], CertificationController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_certification_dto_1.UpdateCertificationDto]),
    __metadata("design:returntype", void 0)
], CertificationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CertificationController.prototype, "remove", null);
exports.CertificationController = CertificationController = __decorate([
    (0, common_1.Controller)('certifications'),
    __metadata("design:paramtypes", [certification_service_1.CertificationService])
], CertificationController);
//# sourceMappingURL=certification.controller.js.map