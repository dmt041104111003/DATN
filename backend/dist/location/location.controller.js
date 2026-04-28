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
exports.LocationController = void 0;
const common_1 = require("@nestjs/common");
let LocationController = class LocationController {
    async reverseGeocode(lat, lng) {
        const cleanLat = String(lat ?? '').trim();
        const cleanLng = String(lng ?? '').trim();
        if (!cleanLat || !cleanLng) {
            throw new common_1.BadRequestException('Thiếu tham số lat hoặc lng.');
        }
        const geoapifyApiKey = process.env.GEOAPIFY_API_KEY;
        if (!geoapifyApiKey) {
            throw new common_1.InternalServerErrorException('Thiếu cấu hình GEOAPIFY_API_KEY trên server.');
        }
        const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${encodeURIComponent(cleanLat)}&lon=${encodeURIComponent(cleanLng)}&lang=vi&apiKey=${encodeURIComponent(geoapifyApiKey)}`;
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) {
            throw new common_1.BadGatewayException('Không truy vấn được Geoapify reverse geocoding.');
        }
        return res.json();
    }
};
exports.LocationController = LocationController;
__decorate([
    (0, common_1.Get)('reverse-geocode'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "reverseGeocode", null);
exports.LocationController = LocationController = __decorate([
    (0, common_1.Controller)('location')
], LocationController);
//# sourceMappingURL=location.controller.js.map