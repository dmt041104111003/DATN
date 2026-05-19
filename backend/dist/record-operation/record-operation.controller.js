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
exports.RecordOperationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
const record_operation_verifier_service_1 = require("./record-operation.verifier.service");
let RecordOperationController = class RecordOperationController {
    constructor(prisma, verifier) {
        this.prisma = prisma;
        this.verifier = verifier;
    }
    getCustodian(req) {
        const custodian = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
        if (!custodian) {
            throw new common_1.HttpException('Không xác định được tài khoản từ phiên đăng nhập.', common_1.HttpStatus.UNAUTHORIZED);
        }
        return String(custodian || '').trim();
    }
    async verifyPending() {
        await this.verifier.verifyPendingNow();
        return { ok: true };
    }
    async list(req, entityTypeParam, entityKeyParam) {
        const custodian = this.getCustodian(req);
        const entityType = String(entityTypeParam || '').trim().toUpperCase();
        const entityKey = decodeURIComponent(String(entityKeyParam || '').trim());
        if (!entityType || (entityType !== 'PRODUCTION' && entityType !== 'CONTAINER')) {
            throw new common_1.HttpException('Thiếu entityType.', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!entityKey)
            throw new common_1.HttpException('Thiếu entityKey.', common_1.HttpStatus.BAD_REQUEST);
        if (entityType === 'PRODUCTION') {
            const production = await this.prisma.production.findUnique({
                where: { inventoryKey: entityKey },
                select: { registeringCustodianAddress: true },
            });
            if (!production ||
                String(production.registeringCustodianAddress || '').trim() !== custodian) {
                throw new common_1.HttpException('Không tìm thấy bản ghi.', common_1.HttpStatus.NOT_FOUND);
            }
        }
        if (entityType === 'CONTAINER') {
            const container = await this.prisma.container.findUnique({
                where: { inventoryKey: entityKey },
                select: { registeringCustodianAddress: true },
            });
            if (!container ||
                String(container.registeringCustodianAddress || '').trim() !== custodian) {
                throw new common_1.HttpException('Không tìm thấy bản ghi.', common_1.HttpStatus.NOT_FOUND);
            }
        }
        const ops = await this.prisma.recordOperation.findMany({
            where: { entityType, entityKey },
            orderBy: { createdAt: 'desc' },
        });
        return Array.isArray(ops) ? ops : [];
    }
};
exports.RecordOperationController = RecordOperationController;
__decorate([
    (0, common_1.Post)('verify-pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecordOperationController.prototype, "verifyPending", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('entityType')),
    __param(2, (0, common_1.Query)('entityKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], RecordOperationController.prototype, "list", null);
exports.RecordOperationController = RecordOperationController = __decorate([
    (0, common_1.Controller)('record-operations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        record_operation_verifier_service_1.RecordOperationVerifierService])
], RecordOperationController);
//# sourceMappingURL=record-operation.controller.js.map