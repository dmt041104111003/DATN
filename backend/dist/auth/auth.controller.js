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
const utils_1 = require("./utils");
const nonce_dto_1 = require("./dto/nonce.dto");
const verify_signature_dto_1 = require("./dto/verify-signature.dto");
const create_profile_dto_1 = require("./dto/create-profile.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    createNonce(body) {
        const addr = (0, utils_1.normalizeAddress)(body.stakeAddress);
        if (!addr) {
            throw new common_1.HttpException({ error: "Missing stakeAddress" }, common_1.HttpStatus.BAD_REQUEST);
        }
        const nonce = this.authService.generateNonce(addr);
        return { nonce };
    }
    verifySignature(body) {
        const { stakeAddress, nonce, signature, key } = body;
        const addr = (0, utils_1.normalizeAddress)(stakeAddress);
        if (!addr || !nonce || !signature || !key) {
            throw new common_1.HttpException({ error: "Missing authentication parameters" }, common_1.HttpStatus.BAD_REQUEST);
        }
        return this.authService.verifyAndIssueToken({
            stakeAddress: addr,
            nonce,
            signature,
            key,
        });
    }
    async createProfile(body) {
        const { stakeAddress, roleId, displayName, location, coordinates } = body;
        const addr = (0, utils_1.normalizeAddress)(stakeAddress);
        if (!addr || !roleId || !displayName) {
            throw new common_1.HttpException({ error: "Missing profile information" }, common_1.HttpStatus.BAD_REQUEST);
        }
        return this.authService.createProfileAndIssueToken({
            stakeAddress: addr,
            roleId,
            displayName,
            location: location !== null && location !== void 0 ? location : undefined,
            coordinates: coordinates !== null && coordinates !== void 0 ? coordinates : undefined,
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("nonce"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nonce_dto_1.NonceRequestDto]),
    __metadata("design:returntype", Object)
], AuthController.prototype, "createNonce", null);
__decorate([
    (0, common_1.Post)("verify"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_signature_dto_1.VerifySignatureDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifySignature", null);
__decorate([
    (0, common_1.Post)("profile"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_profile_dto_1.CreateProfileDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map