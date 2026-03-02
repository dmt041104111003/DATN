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
exports.PinataIpfsClient = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../core/config/config.service");
const pinata_1 = require("pinata");
let PinataIpfsClient = class PinataIpfsClient {
    constructor(config) {
        this.config = config;
        this.pinata = null;
        const jwt = this.config.pinataJwt;
        if (jwt) {
            this.pinata = new pinata_1.PinataSDK({
                pinataJwt: jwt,
                pinataGateway: this.config.pinataGateway,
            });
        }
    }
    getGatewayUrl(hash) {
        const clean = (hash || "").trim().replace(/^ipfs:\/\//, "");
        if (!clean)
            return "";
        if (clean.startsWith("http://") || clean.startsWith("https://")) {
            return clean;
        }
        const base = this.config.pinataGateway
            ? `https://${this.config.pinataGateway
                .replace(/^https?:\/\//, "")
                .replace(/\/$/, "")}`
            : this.config.ipfsGateway.replace(/\/$/, "");
        return `${base}/ipfs/${clean}`;
    }
    async uploadFile(file) {
        var _a, _b, _c, _d;
        if (!this.pinata) {
            throw new common_1.BadRequestException("IPFS (Pinata) chưa cấu hình. Thêm PINATA_JWT vào .env (tạo tại pinata.cloud → API Keys).");
        }
        const buffer = file.buffer;
        const filename = (_a = file.originalname) !== null && _a !== void 0 ? _a : "file";
        const mimetype = (_b = file.mimetype) !== null && _b !== void 0 ? _b : "application/octet-stream";
        if (!buffer || buffer.length === 0) {
            throw new common_1.BadRequestException("No file content provided.");
        }
        try {
            const fileObj = new File([buffer], filename, { type: mimetype });
            const upload = await this.pinata.upload.public.file(fileObj);
            return {
                ipfsHash: (_c = upload.cid) !== null && _c !== void 0 ? _c : "",
                pinSize: (_d = upload.size) !== null && _d !== void 0 ? _d : 0,
            };
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            throw new common_1.BadRequestException(`IPFS upload failed: ${msg}`);
        }
    }
};
exports.PinataIpfsClient = PinataIpfsClient;
exports.PinataIpfsClient = PinataIpfsClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], PinataIpfsClient);
//# sourceMappingURL=pinata-ipfs.client.js.map