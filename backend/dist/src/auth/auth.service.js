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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const jwt = require("jsonwebtoken");
const config_service_1 = require("../config/config.service");
let AuthService = class AuthService {
    constructor(config) {
        this.config = config;
        this.nonceStore = new Map();
    }
    generateNonce(stakeAddress) {
        const nonce = (0, crypto_1.randomBytes)(32).toString("hex");
        this.nonceStore.set(stakeAddress, nonce);
        return nonce;
    }
    verifyAndIssueToken(params) {
        const { stakeAddress, nonce, signature, key } = params;
        const expectedNonce = this.nonceStore.get(stakeAddress);
        if (!expectedNonce || expectedNonce !== nonce) {
            throw new common_1.UnauthorizedException("Nonce không hợp lệ hoặc đã hết hạn.");
        }
        this.nonceStore.delete(stakeAddress);
        if (!signature || !key) {
            throw new common_1.UnauthorizedException("Thiếu chữ ký hoặc public key.");
        }
        const secret = this.config.jwtSecret;
        if (!secret) {
            throw new common_1.UnauthorizedException("JWT_SECRET không được cấu hình.");
        }
        const payload = { sub: stakeAddress, stakeAddress };
        const token = jwt.sign(payload, secret, { expiresIn: "7d" });
        return { token };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map