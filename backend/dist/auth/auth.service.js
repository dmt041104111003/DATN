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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const config_service_1 = require("../core/config/config.service");
const auth_repository_1 = require("./domain/auth.repository");
const generate_nonce_use_case_1 = require("./application/use-cases/generate-nonce.use-case");
const create_profile_and_issue_token_use_case_1 = require("./application/use-cases/create-profile-and-issue-token.use-case");
const verify_and_issue_token_use_case_1 = require("./application/use-cases/verify-and-issue-token.use-case");
let AuthService = class AuthService {
    constructor(config, authRepository, generateNonceUseCase, verifyAndIssueTokenUseCase, createProfileAndIssueTokenUseCase) {
        this.config = config;
        this.authRepository = authRepository;
        this.generateNonceUseCase = generateNonceUseCase;
        this.verifyAndIssueTokenUseCase = verifyAndIssueTokenUseCase;
        this.createProfileAndIssueTokenUseCase = createProfileAndIssueTokenUseCase;
    }
    generateNonce(stakeAddress) {
        return this.generateNonceUseCase.execute(stakeAddress);
    }
    async verifyAndIssueToken(params) {
        return this.verifyAndIssueTokenUseCase.execute(params);
    }
    async createProfileAndIssueToken(params) {
        return this.createProfileAndIssueTokenUseCase.execute(params);
    }
    async getProfileIdFromToken(token) {
        const secret = this.config.jwtSecret;
        if (!secret)
            throw new common_1.UnauthorizedException("JWT_SECRET is not configured.");
        let payload;
        try {
            payload = jwt.verify(token, secret);
        }
        catch (_a) {
            throw new common_1.UnauthorizedException("Invalid token.");
        }
        if (!payload || typeof payload !== "object" || typeof payload.profileId !== "number") {
            throw new common_1.UnauthorizedException("Invalid token payload.");
        }
        return payload.profileId;
    }
    async getProfileRoleFromToken(token) {
        const profileId = await this.getProfileIdFromToken(token);
        const roleCode = await this.authRepository.findProfileRoleCodeById(profileId);
        if (!roleCode)
            throw new common_1.UnauthorizedException("Profile or role not found.");
        return roleCode;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(auth_repository_1.AUTH_REPOSITORY)),
    __metadata("design:paramtypes", [config_service_1.ConfigService, Object, generate_nonce_use_case_1.GenerateNonceUseCase,
        verify_and_issue_token_use_case_1.VerifyAndIssueTokenUseCase,
        create_profile_and_issue_token_use_case_1.CreateProfileAndIssueTokenUseCase])
], AuthService);
//# sourceMappingURL=auth.service.js.map