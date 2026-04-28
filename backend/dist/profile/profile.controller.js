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
exports.ProfileController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const profile_service_1 = require("./profile.service");
let ProfileController = class ProfileController {
    constructor(profileService) {
        this.profileService = profileService;
    }
    getWalletAddress(req) {
        const user = req?.user || {};
        const walletAddress = user.walletAddress || user.paymentAddress || user.sub;
        if (!walletAddress) {
            throw new common_1.HttpException('Unable to determine wallet address from token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return walletAddress;
    }
    getProfileId(req) {
        const profileId = req?.user?.profileId;
        if (!profileId) {
            throw new common_1.HttpException('Profile not found for this user', common_1.HttpStatus.BAD_REQUEST);
        }
        return profileId;
    }
    rethrow(error) {
        if (error instanceof common_1.HttpException)
            throw error;
        throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    setAuthCookie(res, token) {
        const sameSite = process.env.COOKIE_SAMESITE || 'lax';
        const secure = (process.env.COOKIE_SECURE || '').toLowerCase() === 'true'
            ? true
            : process.env.NODE_ENV === 'production';
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure,
            sameSite,
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
    async listProfiles(req) {
        return this.profileService.listProfiles(this.getWalletAddress(req));
    }
    async listProfilesForAdmin(req, res) {
        const rows = await this.profileService.listProfiles(this.getWalletAddress(req));
        const total = rows.length;
        const end = Math.max(total - 1, 0);
        res.setHeader('Content-Range', `profile 0-${end}/${total}`);
        return rows;
    }
    async createProfile(body, req, res) {
        try {
            const userId = req.user.sub;
            const created = await this.profileService.createProfile(userId, body);
            if (created?.token && typeof created.token === 'string') {
                this.setAuthCookie(res, created.token);
            }
            return created?.profile ?? created;
        }
        catch (error) {
            this.rethrow(error);
        }
    }
    async updateProfile(body, req) {
        try {
            return this.profileService.updateProfile(this.getProfileId(req), body);
        }
        catch (error) {
            this.rethrow(error);
        }
    }
    async getProfileById(req, _id) {
        return this.profileService.getProfileById(this.getProfileId(req));
    }
    async replaceProfile(body, req, _id) {
        return this.profileService.updateProfile(this.getProfileId(req), body);
    }
    async patchProfile(body, req, _id) {
        return this.profileService.updateProfile(this.getProfileId(req), body);
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_1.Get)('list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "listProfiles", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "listProfilesForAdmin", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Patch)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getProfileById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "replaceProfile", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "patchProfile", null);
exports.ProfileController = ProfileController = __decorate([
    (0, common_1.Controller)('profile'),
    __metadata("design:paramtypes", [profile_service_1.ProfileService])
], ProfileController);
//# sourceMappingURL=profile.controller.js.map