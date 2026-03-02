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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const config_service_1 = require("../core/config/config.service");
const auth_service_1 = require("../auth/auth.service");
const profile_repository_1 = require("./domain/profile.repository");
const list_profiles_use_case_1 = require("./application/use-cases/list-profiles.use-case");
const list_profiles_by_role_use_case_1 = require("./application/use-cases/list-profiles-by-role.use-case");
const update_profile_use_case_1 = require("./application/use-cases/update-profile.use-case");
const upload_profile_avatar_use_case_1 = require("./application/use-cases/upload-profile-avatar.use-case");
let ProfileService = class ProfileService {
    constructor(config, auth, profileRepository, listProfilesUseCase, listProfilesByRoleUseCase, updateProfileUseCase, uploadProfileAvatarUseCase) {
        this.config = config;
        this.auth = auth;
        this.profileRepository = profileRepository;
        this.listProfilesUseCase = listProfilesUseCase;
        this.listProfilesByRoleUseCase = listProfilesByRoleUseCase;
        this.updateProfileUseCase = updateProfileUseCase;
        this.uploadProfileAvatarUseCase = uploadProfileAvatarUseCase;
    }
    async listProfilesFromToken(token) {
        await this.auth.getProfileIdFromToken(token);
        return this.listProfilesUseCase.execute();
    }
    async listProfilesByRoleCode(roleCode) {
        return this.listProfilesByRoleUseCase.execute(roleCode);
    }
    async updateProfileFromToken(params) {
        var _a, _b;
        const { token, displayName, location, coordinates } = params;
        const secret = this.config.jwtSecret;
        if (!secret) {
            throw new common_1.UnauthorizedException("JWT_SECRET is not configured.");
        }
        let payload;
        try {
            payload = jwt.verify(token, secret);
        }
        catch (_c) {
            throw new common_1.UnauthorizedException("Invalid token.");
        }
        if (!payload ||
            typeof payload !== "object" ||
            typeof payload.profileId !== "number") {
            throw new common_1.UnauthorizedException("Invalid token payload.");
        }
        const profileId = payload.profileId;
        const profile = await this.updateProfileUseCase.execute(profileId, {
            displayName,
            location,
            coordinates,
        });
        const nextPayload = {
            sub: profile.walletAddress,
            stakeAddress: profile.walletAddress,
            profileId: profile.id,
            role: profile.roleCode,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            location: profile.location,
            coordinates: profile.coordinates,
        };
        const nextToken = jwt.sign(nextPayload, secret, { expiresIn: "7d" });
        return {
            token: nextToken,
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
    async uploadProfileAvatarFromToken(params) {
        var _a, _b;
        const { token, imageDataUrl } = params;
        const secret = this.config.jwtSecret;
        if (!secret) {
            throw new common_1.UnauthorizedException("JWT_SECRET is not configured.");
        }
        let payload;
        try {
            payload = jwt.verify(token, secret);
        }
        catch (_c) {
            throw new common_1.UnauthorizedException("Invalid token.");
        }
        if (!payload ||
            typeof payload !== "object" ||
            typeof payload.profileId !== "number") {
            throw new common_1.UnauthorizedException("Invalid token payload.");
        }
        const profileId = payload.profileId;
        const profile = await this.uploadProfileAvatarUseCase.execute(profileId, imageDataUrl);
        const nextPayload = {
            sub: profile.walletAddress,
            stakeAddress: profile.walletAddress,
            profileId: profile.id,
            role: profile.roleCode,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            location: profile.location,
            coordinates: profile.coordinates,
        };
        const nextToken = jwt.sign(nextPayload, secret, { expiresIn: "7d" });
        return {
            token: nextToken,
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
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(profile_repository_1.PROFILE_REPOSITORY)),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        auth_service_1.AuthService, Object, list_profiles_use_case_1.ListProfilesUseCase,
        list_profiles_by_role_use_case_1.ListProfilesByRoleUseCase,
        update_profile_use_case_1.UpdateProfileUseCase,
        upload_profile_avatar_use_case_1.UploadProfileAvatarUseCase])
], ProfileService);
//# sourceMappingURL=profile.service.js.map