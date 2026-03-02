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
exports.PrismaCertificateRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PrismaCertificateRepository = class PrismaCertificateRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listCertificates(issuerProfileId, options) {
        var _a, _b, _c, _d;
        const page = Math.max(1, (_a = options === null || options === void 0 ? void 0 : options.page) !== null && _a !== void 0 ? _a : 1);
        const pageSize = Math.min(100, Math.max(1, (_b = options === null || options === void 0 ? void 0 : options.pageSize) !== null && _b !== void 0 ? _b : 20));
        const skip = (page - 1) * pageSize;
        const where = { issuerProfileId };
        if ((_c = options === null || options === void 0 ? void 0 : options.batchId) === null || _c === void 0 ? void 0 : _c.trim()) {
            where.batchId = options.batchId.trim();
        }
        else if ((_d = options === null || options === void 0 ? void 0 : options.search) === null || _d === void 0 ? void 0 : _d.trim()) {
            const q = options.search.trim();
            where.OR = [
                { title: { contains: q, mode: "insensitive" } },
                { imageUrl: { contains: q, mode: "insensitive" } },
                { batchId: { contains: q, mode: "insensitive" } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.certificate.findMany({
                where,
                include: {
                    batch: { select: { code: true, name: true } },
                },
                orderBy: { issuedAt: "desc" },
                skip,
                take: pageSize,
            }),
            this.prisma.certificate.count({ where }),
        ]);
        return {
            total,
            items: items.map((c) => {
                var _a, _b, _c, _d, _e, _f;
                return ({
                    id: c.id,
                    title: c.title,
                    imageUrl: (_a = c.imageUrl) !== null && _a !== void 0 ? _a : null,
                    issuedAt: c.issuedAt,
                    batchId: c.batchId,
                    batchName: (_c = (_b = c.batch) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : c.batchId,
                    productBatchCode: c.batchId,
                    productBatchName: (_e = (_d = c.batch) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : null,
                    metadata: (_f = c.metadata) !== null && _f !== void 0 ? _f : null,
                });
            }),
        };
    }
    async getCertificateById(id, issuerProfileId) {
        var _a, _b, _c, _d, _e, _f;
        const cert = await this.prisma.certificate.findFirst({
            where: { id, issuerProfileId },
            include: { batch: { select: { code: true, name: true } } },
        });
        if (!cert)
            return null;
        return {
            id: cert.id,
            title: cert.title,
            imageUrl: (_a = cert.imageUrl) !== null && _a !== void 0 ? _a : null,
            issuedAt: cert.issuedAt,
            metadata: (_b = cert.metadata) !== null && _b !== void 0 ? _b : null,
            batchId: cert.batchId,
            batchName: (_d = (_c = cert.batch) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : cert.batchId,
            productBatchCode: cert.batchId,
            productBatchName: (_f = (_e = cert.batch) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : null,
        };
    }
    async batchExistsForIssuer(batchCode, issuerProfileId) {
        const batch = await this.prisma.productBatch.findFirst({
            where: { code: batchCode, minterProfileId: issuerProfileId },
        });
        return !!batch;
    }
    async createCertificate(issuerProfileId, data) {
        var _a;
        const cert = await this.prisma.certificate.create({
            data: {
                title: data.title,
                imageUrl: data.imageUrl,
                batchId: data.batchId,
                issuerProfileId,
                metadata: data.metadata != null ? data.metadata : undefined,
            },
        });
        return {
            id: cert.id,
            title: cert.title,
            imageUrl: (_a = cert.imageUrl) !== null && _a !== void 0 ? _a : null,
        };
    }
};
exports.PrismaCertificateRepository = PrismaCertificateRepository;
exports.PrismaCertificateRepository = PrismaCertificateRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaCertificateRepository);
//# sourceMappingURL=prisma-certificate.repository.js.map