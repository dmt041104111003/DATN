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
exports.ContractController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const contract_service_1 = require("./contract.service");
const contract_create_dto_1 = require("./dto/contract-create.dto");
const contract_save_dto_1 = require("./dto/contract-save.dto");
const contract_burn_dto_1 = require("./dto/contract-burn.dto");
let ContractController = class ContractController {
    constructor(svc) {
        this.svc = svc;
    }
    getSignerAddress(req) {
        return String(req?.user?.paymentAddress || req?.user?.walletAddress || req?.user?.sub || '').trim();
    }
    async info(ownersParam) {
        const owners = ownersParam ? ownersParam.split(',') : [];
        return this.svc.getInfo(owners);
    }
    async create(req, dto) {
        return this.svc.createUnsignedCreateTx(dto, this.getSignerAddress(req));
    }
    async save(req, dto) {
        return this.svc.createUnsignedSaveTx(dto, this.getSignerAddress(req));
    }
    async burn(req, dto) {
        return this.svc.createUnsignedBurnTx(dto, this.getSignerAddress(req));
    }
};
exports.ContractController = ContractController;
__decorate([
    (0, common_1.Get)('info'),
    __param(0, (0, common_1.Query)('owners')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "info", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, contract_create_dto_1.ContractCreateDto]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('save'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, contract_save_dto_1.ContractSaveDto]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "save", null);
__decorate([
    (0, common_1.Post)('burn'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, contract_burn_dto_1.ContractBurnDto]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "burn", null);
exports.ContractController = ContractController = __decorate([
    (0, common_1.Controller)('contract'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [contract_service_1.ContractService])
], ContractController);
//# sourceMappingURL=contract.controller.js.map