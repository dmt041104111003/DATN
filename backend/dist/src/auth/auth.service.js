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
const bech32_1 = require("bech32");
const config_service_1 = require("../config/config.service");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_1 = require("cloudinary");
function isPaymentAddress(addr) {
    const s = (addr || "").trim();
    return s.startsWith("addr_test1") || s.startsWith("addr1");
}
function hexToBech32Address(hex, network) {
    const raw = (hex || "").trim().toLowerCase();
    if (!/^[0-9a-f]+$/.test(raw))
        return null;
    const len = raw.length;
    let bytes;
    if (len === 56) {
        const pkh = Buffer.from(raw, "hex");
        const header = network === "mainnet" ? 0x21 : 0x20;
        bytes = Buffer.concat([Buffer.from([header]), pkh]);
    }
    else if (len === 58 || len === 114) {
        bytes = Buffer.from(raw, "hex");
    }
    else {
        return null;
    }
    try {
        const words = bech32_1.bech32.toWords(bytes);
        const hrp = network === "mainnet" ? "addr" : "addr_test";
        return bech32_1.bech32.encode(hrp, words, 1000);
    }
    catch (_a) {
        return null;
    }
}
let AuthService = class AuthService {
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.nonceStore = new Map();
        const cloudName = this.config.cloudinaryCloudName;
        const apiKey = this.config.cloudinaryApiKey;
        const apiSecret = this.config.cloudinaryApiSecret;
        if (cloudName && apiKey && apiSecret) {
            cloudinary_1.v2.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
            });
        }
    }
    generateNonce(stakeAddress) {
        let addr = (stakeAddress || "").trim();
        if (!isPaymentAddress(addr)) {
            const network = this.config.appNetwork === "mainnet" ? "mainnet" : "preprod";
            const fromHex = hexToBech32Address(addr, network);
            if (fromHex)
                addr = fromHex;
        }
        if (!isPaymentAddress(addr)) {
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
    async verifyAndIssueToken(params) {
        var _a, _b;
        const { stakeAddress, nonce, signature, key } = params;
        let addr = (stakeAddress || "").trim();
        if (!isPaymentAddress(addr)) {
            const network = this.config.appNetwork === "mainnet" ? "mainnet" : "preprod";
            const fromHex = hexToBech32Address(addr, network);
            if (fromHex)
                addr = fromHex;
        }
        if (!isPaymentAddress(addr)) {
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
        const wallet = await this.prisma.wallet.upsert({
            where: { address: addr },
            update: {
                lastLogin: new Date(),
            },
            create: {
                address: addr,
                lastLogin: new Date(),
            },
        });
        const profile = await this.prisma.profile.findFirst({
            where: { walletAddress: wallet.address },
            include: { role: true },
        });
        if (!profile) {
            const roles = await this.prisma.role.findMany({
                select: { id: true, code: true },
                orderBy: { id: "asc" },
            });
            return {
                needProfile: true,
                roles,
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
            role: profile.role.code,
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
                role: profile.role.code,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
                location: (_a = profile.location) !== null && _a !== void 0 ? _a : null,
                coordinates: (_b = profile.coordinates) !== null && _b !== void 0 ? _b : null,
            },
        };
    }
    async createProfileAndIssueToken(params) {
        var _a, _b;
        const { stakeAddress, roleId, displayName, location, coordinates } = params;
        let addr = (stakeAddress || "").trim();
        if (!isPaymentAddress(addr)) {
            const network = this.config.appNetwork === "mainnet" ? "mainnet" : "preprod";
            const fromHex = hexToBech32Address(addr, network);
            if (fromHex)
                addr = fromHex;
        }
        if (!isPaymentAddress(addr)) {
            throw new common_1.BadRequestException("Address must be a payment address (addr_test1... or addr1...) or a valid hex (56, 58 or 114 chars).");
        }
        const wallet = await this.prisma.wallet.upsert({
            where: { address: addr },
            update: {
                lastLogin: new Date(),
            },
            create: {
                address: addr,
                lastLogin: new Date(),
            },
        });
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role) {
            throw new common_1.UnauthorizedException("Invalid role.");
        }
        const profile = await this.prisma.profile.upsert({
            where: { walletAddress: wallet.address },
            update: {
                roleId: role.id,
                displayName,
                location: location !== null && location !== void 0 ? location : null,
                coordinates: coordinates !== null && coordinates !== void 0 ? coordinates : null,
            },
            create: {
                walletAddress: wallet.address,
                roleId: role.id,
                displayName,
                location: location !== null && location !== void 0 ? location : null,
                coordinates: coordinates !== null && coordinates !== void 0 ? coordinates : null,
            },
            include: { role: true },
        });
        const secret = this.config.jwtSecret;
        if (!secret) {
            throw new common_1.UnauthorizedException("JWT_SECRET is not configured.");
        }
        const payload = {
            sub: addr,
            stakeAddress: addr,
            profileId: profile.id,
            role: profile.role.code,
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
                role: profile.role.code,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
                location: (_a = profile.location) !== null && _a !== void 0 ? _a : null,
                coordinates: (_b = profile.coordinates) !== null && _b !== void 0 ? _b : null,
            },
        };
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
        const profile = await this.prisma.profile.update({
            where: { id: profileId },
            data: Object.assign(Object.assign({ displayName }, (location !== undefined && { location: location || null })), (coordinates !== undefined && { coordinates: coordinates || null })),
            include: { role: true, wallet: true },
        });
        const nextPayload = {
            sub: profile.walletAddress,
            stakeAddress: profile.walletAddress,
            profileId: profile.id,
            role: profile.role.code,
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
                role: profile.role.code,
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
        if (!this.config.cloudinaryCloudName) {
            throw new common_1.UnauthorizedException("Cloudinary is not configured.");
        }
        const uploadResult = await cloudinary_1.v2.uploader.upload(imageDataUrl, {
            folder: "profiles",
            overwrite: true,
            invalidate: true,
        });
        const profile = await this.prisma.profile.update({
            where: { id: profileId },
            data: {
                avatarUrl: uploadResult.secure_url,
            },
            include: { role: true, wallet: true },
        });
        const nextPayload = {
            sub: profile.walletAddress,
            stakeAddress: profile.walletAddress,
            profileId: profile.id,
            role: profile.role.code,
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
                role: profile.role.code,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
                location: (_a = profile.location) !== null && _a !== void 0 ? _a : null,
                coordinates: (_b = profile.coordinates) !== null && _b !== void 0 ? _b : null,
            },
        };
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
        var _a;
        const profileId = await this.getProfileIdFromToken(token);
        const profile = await this.prisma.profile.findUnique({
            where: { id: profileId },
            select: { role: { select: { code: true } } },
        });
        if (!((_a = profile === null || profile === void 0 ? void 0 : profile.role) === null || _a === void 0 ? void 0 : _a.code))
            throw new common_1.UnauthorizedException("Profile or role not found.");
        return profile.role.code;
    }
    async listProfilesFromToken(token) {
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
        const profiles = await this.prisma.profile.findMany({
            select: {
                walletAddress: true,
                displayName: true,
                location: true,
                coordinates: true,
                role: { select: { code: true } },
            },
            orderBy: { displayName: "asc" },
        });
        return profiles.map((p) => {
            var _a, _b, _c, _d;
            return ({
                walletAddress: p.walletAddress,
                displayName: p.displayName,
                location: (_a = p.location) !== null && _a !== void 0 ? _a : null,
                coordinates: (_b = p.coordinates) !== null && _b !== void 0 ? _b : null,
                role: (_d = (_c = p.role) === null || _c === void 0 ? void 0 : _c.code) !== null && _d !== void 0 ? _d : null,
            });
        });
    }
    async listProfilesByRoleCode(roleCode) {
        const code = (roleCode || "").trim().toUpperCase();
        if (!code)
            return [];
        const role = await this.prisma.role.findUnique({ where: { code } });
        if (!role)
            return [];
        const profiles = await this.prisma.profile.findMany({
            where: { roleId: role.id },
            select: { id: true, displayName: true, walletAddress: true },
            orderBy: { displayName: "asc" },
        });
        return profiles.map((p) => {
            var _a;
            return ({
                id: p.id,
                displayName: (_a = p.displayName) !== null && _a !== void 0 ? _a : "",
                walletAddress: p.walletAddress,
            });
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map