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
const contract_service_1 = require("./contract.service");
const public_decorator_1 = require("../auth/public.decorator");
let ContractController = class ContractController {
    contractService;
    constructor(contractService) {
        this.contractService = contractService;
    }
    async getInfo(walletAddress) {
        return this.contractService.getPolicyId(walletAddress);
    }
    async createMint(walletAddress, assets) {
        return this.contractService.createMint(walletAddress, assets);
    }
    async createBurn(walletAddress, assets) {
        return this.contractService.createBurn(walletAddress, assets);
    }
    async createUpdate(walletAddress, assets) {
        return this.contractService.createUpdate(walletAddress, assets);
    }
    async createPayment(walletAddress, amount) {
        return this.contractService.createPayment(walletAddress, amount);
    }
};
exports.ContractController = ContractController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('info'),
    __param(0, (0, common_1.Query)('walletAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "getInfo", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('mint'),
    __param(0, (0, common_1.Body)('walletAddress')),
    __param(1, (0, common_1.Body)('assets')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "createMint", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('burn'),
    __param(0, (0, common_1.Body)('walletAddress')),
    __param(1, (0, common_1.Body)('assets')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "createBurn", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)('walletAddress')),
    __param(1, (0, common_1.Body)('assets')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "createUpdate", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('payment'),
    __param(0, (0, common_1.Body)('walletAddress')),
    __param(1, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "createPayment", null);
exports.ContractController = ContractController = __decorate([
    (0, common_1.Controller)('contract'),
    __metadata("design:paramtypes", [contract_service_1.ContractService])
], ContractController);
//# sourceMappingURL=contract.controller.js.map