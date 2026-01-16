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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpfsService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = __importDefault(require("@pinata/sdk"));
let IpfsService = class IpfsService {
    pinata;
    constructor() {
        const apiKey = process.env.PINATA_API_KEY;
        const secretKey = process.env.PINATA_SECRET_KEY;
        if (!apiKey || !secretKey) {
            console.warn('PINATA_API_KEY or PINATA_SECRET_KEY not set. IPFS upload will be disabled.');
        }
        else {
            this.pinata = new sdk_1.default(apiKey, secretKey);
        }
    }
    async uploadFile(file, metadata) {
        if (!this.pinata) {
            throw new common_1.BadRequestException('IPFS service not configured. Set PINATA_API_KEY and PINATA_SECRET_KEY.');
        }
        try {
            const { Readable } = await import('stream');
            const readableStream = Readable.from(file.buffer);
            const options = {
                pinataMetadata: {
                    name: metadata?.name || file.originalname,
                },
            };
            const result = await this.pinata.pinFileToIPFS(readableStream, options);
            const cid = result.IpfsHash;
            const url = `ipfs://${cid}`;
            return { cid, url };
        }
        catch (error) {
            console.error('IPFS upload error:', error);
            throw new common_1.BadRequestException('Failed to upload file to IPFS');
        }
    }
    async uploadJson(data, metadata) {
        if (!this.pinata) {
            throw new common_1.BadRequestException('IPFS service not configured');
        }
        try {
            const options = {
                pinataMetadata: {
                    name: metadata?.name || 'metadata.json',
                },
            };
            const result = await this.pinata.pinJSONToIPFS(data, options);
            const cid = result.IpfsHash;
            const url = `ipfs://${cid}`;
            return { cid, url };
        }
        catch (error) {
            console.error('IPFS JSON upload error:', error);
            throw new common_1.BadRequestException('Failed to upload JSON to IPFS');
        }
    }
    async unpin(cid) {
        if (!this.pinata)
            return;
        try {
            await this.pinata.unpin(cid);
        }
        catch (error) {
            console.error('IPFS unpin error:', error);
        }
    }
    toGatewayUrl(ipfsUrl) {
        if (ipfsUrl.startsWith('ipfs://')) {
            const cid = ipfsUrl.replace('ipfs://', '');
            return `https://gateway.pinata.cloud/ipfs/${cid}`;
        }
        return ipfsUrl;
    }
};
exports.IpfsService = IpfsService;
exports.IpfsService = IpfsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], IpfsService);
//# sourceMappingURL=ipfs.service.js.map