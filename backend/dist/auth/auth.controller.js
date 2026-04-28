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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    cookieConfig(maxAge) {
        const envSameSite = String(process.env.COOKIE_SAMESITE || '').trim().toLowerCase();
        const sameSite = (envSameSite || (process.env.NODE_ENV === 'production' ? 'none' : 'lax'));
        const envSecure = (process.env.COOKIE_SECURE || '').toLowerCase();
        const secure = envSecure ? envSecure === 'true' : process.env.NODE_ENV === 'production' || sameSite === 'none';
        return { httpOnly: true, secure, sameSite, path: '/', maxAge };
    }
    setAuthCookie(res, token) {
        res.cookie('auth_token', token, this.cookieConfig(7 * 24 * 60 * 60 * 1000));
    }
    clearAuthCookie(res) {
        res.cookie('auth_token', '', this.cookieConfig(0));
    }
    async createNonce(body) {
        const addr = this.normalizeAddress(body.stakeAddress);
        if (!addr)
            throw new common_1.HttpException('Missing stakeAddress', common_1.HttpStatus.BAD_REQUEST);
        const nonce = await this.authService.generateNonce(addr);
        return { nonce };
    }
    async verifySignature(body, res) {
        const addr = this.normalizeAddress(body.stakeAddress);
        if (!addr || !body.nonce || !body.signature || !body.key) {
            throw new common_1.HttpException('Missing authentication parameters', common_1.HttpStatus.BAD_REQUEST);
        }
        const result = await this.authService.verifyAndIssueToken({
            stakeAddress: addr,
            nonce: body.nonce,
            signature: body.signature,
            key: body.key,
        });
        if (result?.token && typeof result.token === 'string') {
            this.setAuthCookie(res, result.token);
        }
        return result;
    }
    async logout(res) {
        this.clearAuthCookie(res);
        return { success: true };
    }
    async getRoles() {
        return this.authService.getRoles();
    }
    async getProfile(req) {
        const user = req?.user || null;
        const roleCode = String(user?.role || '').trim() || null;
        return {
            user,
            profile: roleCode ? {
                id: user?.profileId || null,
                walletAddress: user?.walletAddress || user?.paymentAddress || user?.sub || null,
                roleCode,
                displayName: user?.displayName || null,
            } : null,
        };
    }
    normalizeAddress(input) {
        if (typeof input === 'string') {
            const trimmed = input.trim();
            return trimmed || null;
        }
        if (input && typeof input === 'object' && input.address) {
            const trimmed = String(input.address).trim();
            return trimmed || null;
        }
        return null;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('nonce'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createNonce", null);
__decorate([
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifySignature", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map