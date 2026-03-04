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
        if ((_c = options === null || options === void 0 ? void 0 : options.attachedToBatchId) === null || _c === void 0 ? void 0 : _c.trim()) {
            where.productBatches = {
                some: { batchId: options.attachedToBatchId.trim() },
            };
        }
        if ((_d = options === null || options === void 0 ? void 0 : options.search) === null || _d === void 0 ? void 0 : _d.trim()) {
            const q = options.search.trim();
            where.OR = [
                { title: { contains: q, mode: "insensitive" } },
                { imageUrl: { contains: q, mode: "insensitive" } },
                { number: { contains: q, mode: "insensitive" } },
                { authority: { contains: q, mode: "insensitive" } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.certificate.findMany({
                where,
                orderBy: { issuedAt: "desc" },
                skip,
                take: pageSize,
            }),
            this.prisma.certificate.count({ where }),
        ]);
        return {
            total,
            items: items.map((c) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                return ({
                    id: c.id,
                    title: c.title,
                    imageUrl: (_a = c.imageUrl) !== null && _a !== void 0 ? _a : null,
                    issuedAt: c.issuedAt,
                    number: (_b = c.number) !== null && _b !== void 0 ? _b : null,
                    authority: (_c = c.authority) !== null && _c !== void 0 ? _c : null,
                    expiryDate: (_d = c.expiryDate) !== null && _d !== void 0 ? _d : null,
                    documentType: (_e = c.documentType) !== null && _e !== void 0 ? _e : null,
                    standardReference: (_f = c.standardReference) !== null && _f !== void 0 ? _f : null,
                    scope: (_g = c.scope) !== null && _g !== void 0 ? _g : null,
                    documentUrl: (_h = c.documentUrl) !== null && _h !== void 0 ? _h : null,
                });
            }),
        };
    }
    async getCertificateById(id, issuerProfileId) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const cert = await this.prisma.certificate.findFirst({
            where: { id, issuerProfileId },
        });
        if (!cert)
            return null;
        return {
            id: cert.id,
            title: cert.title,
            imageUrl: (_a = cert.imageUrl) !== null && _a !== void 0 ? _a : null,
            issuedAt: cert.issuedAt,
            number: (_b = cert.number) !== null && _b !== void 0 ? _b : null,
            authority: (_c = cert.authority) !== null && _c !== void 0 ? _c : null,
            expiryDate: (_d = cert.expiryDate) !== null && _d !== void 0 ? _d : null,
            documentType: (_e = cert.documentType) !== null && _e !== void 0 ? _e : null,
            standardReference: (_f = cert.standardReference) !== null && _f !== void 0 ? _f : null,
            scope: (_g = cert.scope) !== null && _g !== void 0 ? _g : null,
            documentUrl: (_h = cert.documentUrl) !== null && _h !== void 0 ? _h : null,
        };
    }
    async createCertificate(issuerProfileId, data) {
        var _a, _b, _c, _d, _e, _f, _g;
        const cert = await this.prisma.certificate.create({
            data: {
                title: data.title,
                imageUrl: data.imageUrl,
                issuerProfileId,
                subjectProfileId: issuerProfileId,
                number: data.number != null && typeof data.number === "string" && data.number.trim
                    ? data.number.trim()
                    : (_a = data.number) !== null && _a !== void 0 ? _a : null,
                authority: data.authority != null &&
                    typeof data.authority === "string" &&
                    data.authority.trim
                    ? data.authority.trim()
                    : (_b = data.authority) !== null && _b !== void 0 ? _b : null,
                expiryDate: data.expiryDate
                    ? new Date(data.expiryDate)
                    : null,
                documentType: (_c = data.documentType) !== null && _c !== void 0 ? _c : undefined,
                standardReference: (_d = data.standardReference) !== null && _d !== void 0 ? _d : undefined,
                scope: (_e = data.scope) !== null && _e !== void 0 ? _e : undefined,
                documentUrl: (_f = data.documentUrl) !== null && _f !== void 0 ? _f : undefined,
            },
        });
        return {
            id: cert.id,
            title: cert.title,
            imageUrl: (_g = cert.imageUrl) !== null && _g !== void 0 ? _g : null,
        };
    }
    async setCertificatesForBatch(batchId, issuerProfileId, certificateIds) {
        const batch = await this.prisma.productBatch.findFirst({
            where: { batchId, minterProfileId: issuerProfileId },
            select: { id: true },
        });
        if (!batch) {
            throw new Error("Batch not found or you are not the minter.");
        }
        const validIds = certificateIds.filter(Number.isFinite);
        const certs = await this.prisma.certificate.findMany({
            where: {
                id: { in: validIds },
                issuerProfileId,
            },
            select: { id: true },
        });
        const ids = certs.map((c) => c.id);
        await this.prisma.productBatch.update({
            where: { batchId },
            data: {
                certificates: {
                    set: ids.map((id) => ({ id })),
                },
            },
        });
    }
    async getCertificateIdsByBatchId(batchId, issuerProfileId) {
        const batch = await this.prisma.productBatch.findFirst({
            where: { batchId, minterProfileId: issuerProfileId },
            include: {
                certificates: { select: { id: true } },
            },
        });
        if (!batch)
            return [];
        return batch.certificates.map((c) => c.id);
    }
};
exports.PrismaCertificateRepository = PrismaCertificateRepository;
exports.PrismaCertificateRepository = PrismaCertificateRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaCertificateRepository);
//# sourceMappingURL=prisma-certificate.repository.js.map