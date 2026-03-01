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
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async listProfiles(token) {
        if (!token) {
            throw new common_1.HttpException({ error: "Missing token" }, common_1.HttpStatus.BAD_REQUEST);
        }
        return this.authService.listProfilesFromToken(token);
    }
    createNonce(stakeAddress) {
        if (!stakeAddress) {
            throw new common_1.HttpException({ error: "Missing stakeAddress" }, common_1.HttpStatus.BAD_REQUEST);
        }
        const nonce = this.authService.generateNonce(stakeAddress);
        return { nonce };
    }
    verifySignature(body) {
        const { stakeAddress, nonce, signature, key } = body;
        if (!stakeAddress || !nonce || !signature || !key) {
            throw new common_1.HttpException({ error: "Missing authentication parameters" }, common_1.HttpStatus.BAD_REQUEST);
        }
        return this.authService.verifyAndIssueToken({
            stakeAddress,
            nonce,
            signature,
            key,
        });
    }
    async createProfile(body) {
        const { stakeAddress, roleId, displayName, location, coordinates } = body;
        if (!stakeAddress || !roleId || !displayName) {
            throw new common_1.HttpException({ error: "Missing profile information" }, common_1.HttpStatus.BAD_REQUEST);
        }
        return this.authService.createProfileAndIssueToken({
            stakeAddress,
            roleId,
            displayName,
            location: location !== null && location !== void 0 ? location : undefined,
            coordinates: coordinates !== null && coordinates !== void 0 ? coordinates : undefined,
        });
    }
    async updateProfile(body) {
        const { token, displayName, location, coordinates } = body;
        if (!token || !displayName) {
            throw new common_1.HttpException({ error: "Missing profile update information" }, common_1.HttpStatus.BAD_REQUEST);
        }
        return this.authService.updateProfileFromToken({
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
        return this.authService.uploadProfileAvatarFromToken({
            token,
            imageDataUrl,
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)("profiles"),
    __param(0, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "listProfiles", null);
__decorate([
    (0, common_1.Post)("nonce"),
    __param(0, (0, common_1.Body)("stakeAddress")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], AuthController.prototype, "createNonce", null);
__decorate([
    (0, common_1.Post)("verify"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifySignature", null);
__decorate([
    (0, common_1.Post)("profile"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Patch)("profile"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)("profile/avatar"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "uploadAvatar", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map