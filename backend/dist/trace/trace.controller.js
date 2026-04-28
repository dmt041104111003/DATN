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
let TraceController = class TraceController {
    constructor(traceService) {
        this.traceService = traceService;
    }
    async getProductTrace(inventoryKey) {
        const decoded = decodeURIComponent(inventoryKey);
        return this.traceService.getProductTrace(decoded);
    }
    async getProductTraceHistory(inventoryKey, page, limit) {
        const decoded = decodeURIComponent(inventoryKey);
        return this.traceService.getTraceHistory(decoded, page, limit);
    }
};
exports.TraceController = TraceController;
__decorate([
    (0, common_1.Get)(':inventoryKey'),
    __param(0, (0, common_1.Param)('inventoryKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "getProductTrace", null);
__decorate([
    (0, common_1.Get)(':inventoryKey/history'),
    __param(0, (0, common_1.Param)('inventoryKey')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], TraceController.prototype, "getProductTraceHistory", null);
exports.TraceController = TraceController = __decorate([
    (0, common_1.Controller)('trace'),
    __metadata("design:paramtypes", [trace_service_1.TraceService])
], TraceController);
//# sourceMappingURL=trace.controller.js.map