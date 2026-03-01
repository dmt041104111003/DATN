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
const auth_service_1 = require("../auth/auth.service");
const profile_service_1 = require("./profile.service");
let ProfileController = class ProfileController {
    constructor(profileService, authService) {
        this.profileService = profileService;
        this.authService = authService;
    }
    async listProfiles(token) {
        if (!token) {
            throw new common_1.HttpException({ error: "Missing token" }, common_1.HttpStatus.BAD_REQUEST);
        }
        return this.profileService.listProfilesFromToken(token);
    }
    async listProfilesByRole(role, token) {
        if (!(role === null || role === void 0 ? void 0 : role.trim())) {
            throw new common_1.HttpException({ error: "Missing role" }, common_1.HttpStatus.BAD_REQUEST);
        }
        if (!(token === null || token === void 0 ? void 0 : token.trim())) {
            throw new common_1.HttpException({ error: "Missing token" }, common_1.HttpStatus.UNAUTHORIZED);
        }
        await this.authService.getProfileIdFromToken(token.trim());
        return this.profileService.listProfilesByRoleCode(role.trim());
    }
    async updateProfile(body) {
        const { token, displayName, location, coordinates } = body;
        if (!token || !displayName) {
            throw new common_1.HttpException({ error: "Missing profile update information" }, common_1.HttpStatus.BAD_REQUEST);
        }
        return this.profileService.updateProfileFromToken({
            token,
            displayName,
            location,
            coordinates,
        });
    }
    async uploadAvatar(body) {
        const { token, imageDataUrl } = body;
        if (!token || !imageDataUrl) {
            throw new common_1.HttpException({ error: "Missing avatar upload information" }, common_1.HttpStatus.BAD_REQUEST);
        }
        return this.profileService.uploadProfileAvatarFromToken({
            token,
            imageDataUrl,
        });
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_1.Get)("profiles"),
    __param(0, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "listProfiles", null);
__decorate([
    (0, common_1.Get)("profiles/by-role"),
    __param(0, (0, common_1.Query)("role")),
    __param(1, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "listProfilesByRole", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)("avatar"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "uploadAvatar", null);
exports.ProfileController = ProfileController = __decorate([
    (0, common_1.Controller)("profile"),
    __metadata("design:paramtypes", [profile_service_1.ProfileService,
        auth_service_1.AuthService])
], ProfileController);
//# sourceMappingURL=profile.controller.js.map