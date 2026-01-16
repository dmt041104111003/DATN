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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const ipfs_service_1 = require("../ipfs/ipfs.service");
let MediaService = class MediaService {
    prisma;
    ipfs;
    constructor(prisma, ipfs) {
        this.prisma = prisma;
        this.ipfs = ipfs;
    }
    async findAllByUser(userId) {
        const media = await this.prisma.media.findMany({ where: { userId } });
        return media.map((m) => ({
            ...m,
            gatewayUrl: this.ipfs.toGatewayUrl(m.url),
        }));
    }
    async findOne(id, userId) {
        const item = await this.prisma.media.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Media not found');
        if (item.userId !== userId)
            throw new common_1.ForbiddenException('Not your media');
        return {
            ...item,
            gatewayUrl: this.ipfs.toGatewayUrl(item.url),
        };
    }
    async uploadToIpfs(userId, file) {
        const { cid, url } = await this.ipfs.uploadFile(file, {
            name: file.originalname,
        });
        const type = this.getFileType(file.mimetype);
        const media = await this.prisma.media.create({
            data: {
                userId,
                name: file.originalname,
                type,
                url,
            },
        });
        return {
            ...media,
            cid,
            gatewayUrl: this.ipfs.toGatewayUrl(url),
        };
    }
    async uploadBatchToIpfs(userId, files) {
        const results = await Promise.all(files.map((file) => this.uploadToIpfs(userId, file)));
        return results;
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        return this.prisma.media.update({ where: { id }, data: dto });
    }
    async remove(id, userId) {
        const media = await this.findOne(id, userId);
        if (media.url.startsWith('ipfs://')) {
            const cid = media.url.replace('ipfs://', '');
            await this.ipfs.unpin(cid);
        }
        return this.prisma.media.delete({ where: { id } });
    }
    getFileType(mimetype) {
        if (mimetype.startsWith('image/'))
            return 'image';
        if (mimetype.startsWith('video/'))
            return 'video';
        if (mimetype === 'application/pdf')
            return 'pdf';
        return 'other';
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ipfs_service_1.IpfsService])
], MediaService);
//# sourceMappingURL=media.service.js.map