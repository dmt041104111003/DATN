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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceService = void 0;
const common_1 = require("@nestjs/common");
const trace_asset_use_case_1 = require("./application/use-cases/trace-asset.use-case");
let TraceService = class TraceService {
    constructor(traceAssetUseCase) {
        this.traceAssetUseCase = traceAssetUseCase;
    }
    async trace(policyId, assetName) {
        return this.traceAssetUseCase.execute(policyId, assetName);
    }
};
exports.TraceService = TraceService;
exports.TraceService = TraceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [trace_asset_use_case_1.TraceAssetUseCase])
], TraceService);
//# sourceMappingURL=trace.service.js.map