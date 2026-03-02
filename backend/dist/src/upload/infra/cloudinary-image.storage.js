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
exports.CloudinaryImageStorage = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const config_service_1 = require("../../core/config/config.service");
let CloudinaryImageStorage = class CloudinaryImageStorage {
    constructor(config) {
        this.config = config;
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
    async upload(request) {
        const trimmed = (request.imageDataUrl || "").trim();
        if (!trimmed) {
            throw new common_1.BadRequestException("imageDataUrl is required.");
        }
        if (!this.config.cloudinaryCloudName) {
            throw new common_1.BadRequestException("Cloudinary is not configured.");
        }
        const uploadResult = await cloudinary_1.v2.uploader.upload(trimmed, {
            folder: request.folder || "uploads",
            overwrite: true,
            invalidate: true,
        });
        return { url: uploadResult.secure_url };
    }
};
exports.CloudinaryImageStorage = CloudinaryImageStorage;
exports.CloudinaryImageStorage = CloudinaryImageStorage = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], CloudinaryImageStorage);
//# sourceMappingURL=cloudinary-image.storage.js.map