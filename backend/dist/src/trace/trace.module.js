"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceModule = void 0;
const common_1 = require("@nestjs/common");
const cardano_module_1 = require("../cardano/cardano.module");
const auth_module_1 = require("../auth/auth.module");
const trace_service_1 = require("./trace.service");
const trace_controller_1 = require("./trace.controller");
let TraceModule = class TraceModule {
};
exports.TraceModule = TraceModule;
exports.TraceModule = TraceModule = __decorate([
    (0, common_1.Module)({
        imports: [cardano_module_1.CardanoModule, auth_module_1.AuthModule],
        controllers: [trace_controller_1.TraceController],
        providers: [trace_service_1.TraceService],
        exports: [trace_service_1.TraceService],
    })
], TraceModule);
//# sourceMappingURL=trace.module.js.map