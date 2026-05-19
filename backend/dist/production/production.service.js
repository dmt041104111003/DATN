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
exports.ProductionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ENTITY_TYPE = 'PRODUCTION';
function cleanString(v) {
    return String(v ?? '').trim();
}
let ProductionService = class ProductionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    certToString(value) {
        if (!Array.isArray(value))
            return null;
        const packed = value.map((x) => cleanString(x)).filter(Boolean).join('|');
        return packed || null;
    }
    async attachMediaBatch(entityKey, addr, evidenceFiles) {
        for (const uri of evidenceFiles) {
            const ipfsUri = cleanString(uri);
            if (!ipfsUri)
                continue;
            await this.prisma.image.upsert({
                where: {
                    productionInventoryKey_ipfsUri: {
                        productionInventoryKey: entityKey,
                        ipfsUri,
                    },
                },
                create: {
                    productionInventoryKey: entityKey,
                    ipfsUri,
                    ipfsHash: ipfsUri.startsWith('ipfs://') ? ipfsUri.slice('ipfs://'.length) : null,
                    createdByAddress: addr || null,
                },
                update: {},
            });
        }
    }
    composeResponse(row, media, latest, txHashOverride) {
        const packed = cleanString(row?.certifications);
        return {
            ...row,
            certifications: packed ? packed.split('|').filter(Boolean) : [],
            images: media,
            evidenceFiles: media,
            txHash: txHashOverride ?? latest?.txHash ?? null,
            verified: txHashOverride ? false : Boolean(latest?.verified),
            verifiedAt: txHashOverride ? null : latest?.verifiedAt ?? null,
        };
    }
    async getMediaByKey(keys) {
        const out = {};
        const k = (keys || []).map(cleanString).filter(Boolean);
        if (k.length === 0)
            return out;
        const rows = await this.prisma.image.findMany({
            where: {
                productionInventoryKey: { in: k },
            },
            select: {
                productionInventoryKey: true,
                ipfsUri: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        for (const row of Array.isArray(rows) ? rows : []) {
            const key = cleanString(row?.productionInventoryKey);
            const ipfsUri = cleanString(row?.ipfsUri);
            if (!key || !ipfsUri)
                continue;
            out[key] ||= [];
            out[key].push(ipfsUri);
        }
        return out;
    }
    async list() {
        const rows = await this.prisma.production.findMany({
            orderBy: { createdAt: 'desc' },
        });
        const keys = (rows || []).map((r) => cleanString(r.inventoryKey)).filter(Boolean);
        const mediaByKey = await this.getMediaByKey(keys);
        const ops = await this.prisma.recordOperation.findMany({
            where: { entityType: ENTITY_TYPE, entityKey: { in: keys } },
            orderBy: { createdAt: 'desc' },
        });
        const latestByKey = new Map();
        for (const op of ops || []) {
            const key = cleanString(op.entityKey);
            if (!key || latestByKey.has(key))
                continue;
            latestByKey.set(key, op);
        }
        return (rows || []).map((r) => {
            const key = cleanString(r.inventoryKey);
            const m = mediaByKey[key] || [];
            const latest = latestByKey.get(key);
            return this.composeResponse(r, m, latest);
        });
    }
    async create(createdBy, data) {
        const addr = cleanString(createdBy);
        const traceSchemeRef = cleanString(data.traceSchemeRef);
        const inventoryKey = cleanString(data.inventoryKey);
        const txHash = cleanString(data.txHash);
        const seedingDate = data?.seedingDate ? new Date(data.seedingDate) : null;
        const production = await this.prisma.production.create({
            data: {
                traceSchemeRef,
                inventoryKey,
                code: cleanString(data.code) || `VU_${Date.now()}`,
                registeringCustodianAddress: addr,
                facilityId: cleanString(data.facilityId),
                location: cleanString(data.location),
                farmingMethod: cleanString(data.farmingMethod),
                cropType: cleanString(data.cropType),
                varietyId: cleanString(data.varietyId) || null,
                customVariety: cleanString(data.customVariety) || null,
                seedingDate,
                harvestDate: data?.harvestDate ? new Date(data.harvestDate) : null,
                expectedYieldKg: cleanString(data.expectedYieldKg) || null,
                actualYieldKg: cleanString(data.actualYieldKg) || null,
                status: 'CREATED',
                certifications: this.certToString(data?.certifications),
                customCertificationName: cleanString(data?.customCertificationName) || null,
                note: cleanString(data.note) || null,
            },
        });
        await this.prisma.recordOperation.create({
            data: {
                entityType: ENTITY_TYPE,
                entityKey: inventoryKey,
                productionInventoryKey: inventoryKey,
                opType: 'CREATE',
                txHash,
                verified: false,
                verifiedAt: null,
            },
        });
        const evidenceFiles = Array.isArray(data?.evidenceFiles) ? data.evidenceFiles : [];
        await this.attachMediaBatch(inventoryKey, addr, evidenceFiles);
        return this.composeResponse(production, [...evidenceFiles], undefined, txHash);
    }
    async update(createdBy, inventoryKey, data) {
        const addr = cleanString(createdBy);
        const key = decodeURIComponent(cleanString(inventoryKey));
        const existing = await this.prisma.production.findUnique({ where: { inventoryKey: key } });
        if (!existing)
            throw new common_1.NotFoundException('Không tìm thấy bản ghi sản xuất.');
        const nextStatus = cleanString(data.status || existing.status).toUpperCase();
        const patch = {};
        if (nextStatus === 'CREATED' || nextStatus === 'UPDATED') {
            if (cleanString(existing.varietyId) === '' && data.varietyId !== undefined) {
                patch.varietyId = cleanString(data.varietyId) || null;
            }
            if (data.customVariety !== undefined)
                patch.customVariety = cleanString(data.customVariety) || null;
            if (data.note !== undefined)
                patch.note = cleanString(data.note) || null;
            if (data.certifications !== undefined) {
                patch.certifications = this.certToString(data.certifications);
            }
            if (data.customCertificationName !== undefined) {
                patch.customCertificationName = cleanString(data.customCertificationName) || null;
            }
            if (data.expectedYieldKg !== undefined) {
                const expected = cleanString(data.expectedYieldKg);
                patch.expectedYieldKg = expected || null;
            }
        }
        if (nextStatus === 'CLOSED') {
            const harvestDate = data?.harvestDate ? new Date(data.harvestDate) : null;
            const actualYieldKg = cleanString(data?.actualYieldKg);
            patch.harvestDate = harvestDate || null;
            patch.actualYieldKg = actualYieldKg;
        }
        patch.status = nextStatus;
        const updated = await this.prisma.production.update({
            where: { inventoryKey: key },
            data: patch,
        });
        const evidenceFiles = Array.isArray(data?.evidenceFiles) ? data.evidenceFiles : [];
        await this.attachMediaBatch(key, addr, evidenceFiles);
        const txHash = cleanString(data.txHash);
        const opType = nextStatus === 'CLOSED' ? 'HARVEST_CLOSE' : 'UPDATE';
        if (txHash) {
            await this.prisma.recordOperation.create({
                data: {
                    entityType: ENTITY_TYPE,
                    entityKey: key,
                    productionInventoryKey: key,
                    opType,
                    txHash,
                    verified: false,
                    verifiedAt: null,
                },
            });
        }
        const latestOpAfterUpdate = txHash
            ? null
            : await this.prisma.recordOperation.findFirst({
                where: { entityType: ENTITY_TYPE, entityKey: key },
                orderBy: { createdAt: 'desc' },
            });
        return this.composeResponse(updated, [...evidenceFiles], latestOpAfterUpdate, txHash || undefined);
    }
    async deleteByInventoryKey(inventoryKeyRaw, txHashRaw) {
        const key = cleanString(inventoryKeyRaw);
        const txHash = cleanString(txHashRaw);
        const existing = await this.prisma.production.findUnique({
            where: { inventoryKey: key },
        });
        if (!existing)
            throw new common_1.NotFoundException('Không tìm thấy bản ghi sản xuất.');
        await this.prisma.recordOperation.create({
            data: {
                entityType: ENTITY_TYPE,
                entityKey: key,
                productionInventoryKey: key,
                opType: 'DELETE',
                txHash,
                verified: false,
                verifiedAt: null,
            },
        });
        return { inventoryKey: key, pendingDelete: true };
    }
};
exports.ProductionService = ProductionService;
exports.ProductionService = ProductionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductionService);
//# sourceMappingURL=production.service.js.map