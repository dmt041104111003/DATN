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
exports.GenerateNonceUseCase = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const config_service_1 = require("../../../core/config/config.service");
const utils_1 = require("../../utils");
const nonce_store_port_1 = require("../../domain/nonce-store.port");
let GenerateNonceUseCase = class GenerateNonceUseCase {
    constructor(config, nonceStore) {
        this.config = config;
        this.nonceStore = nonceStore;
    }
    execute(stakeAddress) {
        const network = this.config.appNetwork === "mainnet" ? "mainnet" : "preprod";
        const addr = (0, utils_1.normalizeStakeAddress)(stakeAddress, network);
        if (!(0, utils_1.isPaymentAddress)(addr)) {
            const hint = addr.length > 0
                ? ` Received: ${addr.slice(0, 30)}${addr.length > 30 ? "..." : ""}`
                : " Received empty or invalid type.";
            throw new common_1.BadRequestException("Address must be a payment address (addr_test1... or addr1...) or a valid hex (56, 58 or 114 chars)." +
                hint);
        }
        const nonce = (0, crypto_1.randomBytes)(32).toString("hex");
        this.nonceStore.set(addr, nonce);
        return nonce;
    }
};
exports.GenerateNonceUseCase = GenerateNonceUseCase;
exports.GenerateNonceUseCase = GenerateNonceUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(nonce_store_port_1.NONCE_STORE)),
    __metadata("design:paramtypes", [config_service_1.ConfigService, Object])
], GenerateNonceUseCase);
//# sourceMappingURL=generate-nonce.use-case.js.map