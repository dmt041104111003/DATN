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
exports.VerifyAndIssueTokenUseCase = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const config_service_1 = require("../../../core/config/config.service");
const utils_1 = require("../../utils");
const auth_repository_1 = require("../../domain/auth.repository");
const nonce_store_port_1 = require("../../domain/nonce-store.port");
let VerifyAndIssueTokenUseCase = class VerifyAndIssueTokenUseCase {
    constructor(config, authRepository, nonceStore) {
        this.config = config;
        this.authRepository = authRepository;
        this.nonceStore = nonceStore;
    }
    async execute(params) {
        var _a, _b;
        const { stakeAddress, nonce, signature, key } = params;
        const network = this.config.appNetwork === "mainnet" ? "mainnet" : "preprod";
        const addr = (0, utils_1.normalizeStakeAddress)(stakeAddress, network);
        if (!(0, utils_1.isPaymentAddress)(addr)) {
            throw new common_1.BadRequestException("Address must be a payment address (addr_test1... or addr1...) or a valid hex (56, 58 or 114 chars).");
        }
        const expectedNonce = this.nonceStore.get(addr);
        if (!expectedNonce || expectedNonce !== nonce) {
            throw new common_1.UnauthorizedException("Invalid or expired nonce.");
        }
        this.nonceStore.delete(addr);
        if (!signature || !key) {
            throw new common_1.UnauthorizedException("Missing signature or public key.");
        }
        const wallet = await this.authRepository.upsertWallet(addr, new Date());
        const profile = await this.authRepository.findProfileByWalletAddress(wallet.address);
        if (!profile) {
            return {
                needProfile: true,
            };
        }
        const secret = this.config.jwtSecret;
        if (!secret) {
            throw new common_1.UnauthorizedException("JWT_SECRET is not configured.");
        }
        const payload = {
            sub: addr,
            stakeAddress: addr,
            profileId: profile.id,
            role: profile.roleCode,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            location: profile.location,
            coordinates: profile.coordinates,
        };
        const token = jwt.sign(payload, secret, { expiresIn: "7d" });
        return {
            token,
            profile: {
                id: profile.id,
                role: profile.roleCode,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
                location: (_a = profile.location) !== null && _a !== void 0 ? _a : null,
                coordinates: (_b = profile.coordinates) !== null && _b !== void 0 ? _b : null,
            },
        };
    }
};
exports.VerifyAndIssueTokenUseCase = VerifyAndIssueTokenUseCase;
exports.VerifyAndIssueTokenUseCase = VerifyAndIssueTokenUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(auth_repository_1.AUTH_REPOSITORY)),
    __param(2, (0, common_1.Inject)(nonce_store_port_1.NONCE_STORE)),
    __metadata("design:paramtypes", [config_service_1.ConfigService, Object, Object])
], VerifyAndIssueTokenUseCase);
//# sourceMappingURL=verify-and-issue-token.use-case.js.map