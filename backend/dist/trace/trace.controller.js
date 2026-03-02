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
exports.TraceController = void 0;
const common_1 = require("@nestjs/common");
const trace_service_1 = require("./trace.service");
const trace_dto_1 = require("./dto/trace.dto");
let TraceController = class TraceController {
    constructor(traceService) {
        this.traceService = traceService;
    }
    async trace(body) {
        var _a, _b;
        if (!((_a = body === null || body === void 0 ? void 0 : body.policyId) === null || _a === void 0 ? void 0 : _a.trim()) || !((_b = body === null || body === void 0 ? void 0 : body.assetName) === null || _b === void 0 ? void 0 : _b.trim())) {
            throw new common_1.BadRequestException("policyId and assetName are required.");
        }
        return this.traceService.trace(body.policyId.trim(), body.assetName.trim());
    }
    async getTrace(policyId, assetName) {
        if (!(policyId === null || policyId === void 0 ? void 0 : policyId.trim()) || !(assetName === null || assetName === void 0 ? void 0 : assetName.trim())) {
            throw new common_1.BadRequestException("policyId and assetName are required.");
        }
        return this.traceService.trace(policyId.trim(), assetName.trim());
    }
};
exports.TraceController = TraceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trace_dto_1.TraceBodyDto]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "trace", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("policyId")),
    __param(1, (0, common_1.Query)("assetName")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "getTrace", null);
exports.TraceController = TraceController = __decorate([
    (0, common_1.Controller)("trace"),
    __metadata("design:paramtypes", [trace_service_1.TraceService])
], TraceController);
//# sourceMappingURL=trace.controller.js.map