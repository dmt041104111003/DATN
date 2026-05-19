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
exports.ContainerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ENTITY_TYPE = 'CONTAINER';
function cleanString(v) {
    return String(v ?? '').trim();
}
function buildLocationLabel(provinceId, districtId, wardId) {
    return [cleanString(provinceId), cleanString(districtId), cleanString(wardId)].filter(Boolean).join(', ');
}
function parseStringArray(value) {
    if (Array.isArray(value))
        return value.map((x) => cleanString(x)).filter(Boolean);
    const raw = cleanString(value);
    if (!raw)
        return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed))
            return parsed.map((x) => cleanString(x)).filter(Boolean);
    }
    catch { }
    return raw
        .split(';')
        .map((x) => cleanString(x))
        .filter(Boolean);
}
function makeContainerCode(seq) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = String(Math.floor(Math.random() * 900) + 100);
    return `THUNG_${y}${m}${d}_${rand}_${String(seq).padStart(3, '0')}`;
}
let ContainerService = class ContainerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startBatch(createdBy, totalBoxesRaw) {
        const addr = cleanString(createdBy);
        const totalBoxes = Number(totalBoxesRaw);
        if (!Number.isFinite(totalBoxes) || totalBoxes < 1) {
            throw new Error('Số lượng thùng phải lớn hơn 0.');
        }
        if (totalBoxes > 100) {
            throw new Error('Số lượng thùng tối đa là 100.');
        }
        return await this.prisma.containerBatch.create({
            data: {
                registeringCustodianAddress: addr,
                totalBoxes: Math.floor(totalBoxes),
                completedBoxes: 0,
                status: 'IN_PROGRESS',
            },
        });
    }
    async updateBatchProgress(batchIdRaw, completedBoxesRaw, statusRaw) {
        const batchId = cleanString(batchIdRaw);
        if (!batchId)
            throw new common_1.NotFoundException('Không tìm thấy lô thùng.');
        const completedBoxes = Number(completedBoxesRaw);
        const existing = await this.prisma.containerBatch.findUnique({ where: { id: batchId } });
        if (!existing)
            throw new common_1.NotFoundException('Không tìm thấy lô thùng.');
        const totalBoxes = Number(existing.totalBoxes || 0);
        const nextCompleted = Number.isFinite(completedBoxes)
            ? Math.max(0, Math.min(Math.floor(completedBoxes), totalBoxes))
            : Number(existing.completedBoxes || 0);
        let status = cleanString(statusRaw || existing.status) || 'IN_PROGRESS';
        if (nextCompleted >= totalBoxes)
            status = 'DONE';
        return await this.prisma.containerBatch.update({
            where: { id: batchId },
            data: { completedBoxes: nextCompleted, status },
        });
    }
    toResponse(row, latest, txHashOverride) {
        return {
            ...row,
            participantWalletAddresses: parseStringArray(row?.participantWalletAddresses),
            participantLocationLabels: parseStringArray(row?.participantLocationLabels),
            txHash: txHashOverride ?? latest?.txHash ?? null,
            verified: txHashOverride ? false : Boolean(latest?.verified),
            verifiedAt: txHashOverride ? null : latest?.verifiedAt ?? null,
        };
    }
    buildParticipants(data) {
        const fromRows = Array.isArray(data?.participantRows)
            ? data.participantRows
                .map((row) => ({
                walletAddress: cleanString(row?.walletAddress),
                locationLabel: buildLocationLabel(row?.provinceId, row?.districtId, row?.wardId),
            }))
                .filter((row) => row.walletAddress)
            : [];
        const wallets = fromRows.map((x) => x.walletAddress).filter(Boolean);
        const locationByWallet = new Map();
        for (const row of fromRows) {
            const key = cleanString(row.walletAddress).toLowerCase();
            if (!key)
                continue;
            const location = cleanString(row.locationLabel);
            if (location)
                locationByWallet.set(key, location);
        }
        const locations = wallets.map((wallet) => cleanString(locationByWallet.get(wallet.toLowerCase()) || ''));
        return { wallets, locations };
    }
    async getLatestOp(inventoryKey) {
        return await this.prisma.recordOperation.findFirst({
            where: { entityType: ENTITY_TYPE, entityKey: inventoryKey },
            orderBy: { createdAt: 'desc' },
        });
    }
    async hasWarehouseStorageHistory(inventoryKeyRaw) {
        const inventoryKey = cleanString(inventoryKeyRaw);
        if (!inventoryKey)
            return false;
        const activeStorage = await this.prisma.warehouseStorage.findFirst({
            where: { containerInventoryKey: inventoryKey },
            select: { id: true },
        });
        if (activeStorage)
            return true;
        const op = await this.prisma.recordOperation.findFirst({
            where: {
                entityType: 'WAREHOUSE_STORAGE',
                containerInventoryKey: inventoryKey,
            },
            select: { id: true },
        });
        return Boolean(op);
    }
    async assertContainerMutable(inventoryKeyRaw) {
        const inventoryKey = cleanString(inventoryKeyRaw);
        const locked = await this.hasWarehouseStorageHistory(inventoryKey);
        if (locked) {
            throw new common_1.ConflictException('Container đã có lịch sử nhập/xuất kho nên không được phép cập nhật hoặc xóa.');
        }
    }
    async list(_createdBy) {
        const rows = await this.prisma.container.findMany({
            orderBy: { createdAt: 'desc' },
        });
        const keys = rows.map((r) => cleanString(r.inventoryKey)).filter(Boolean);
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
        const inStorageRows = keys.length
            ? await this.prisma.warehouseStorage.findMany({
                where: { containerInventoryKey: { in: keys } },
                select: { containerInventoryKey: true },
            })
            : [];
        const historyOps = keys.length
            ? await this.prisma.recordOperation.findMany({
                where: {
                    entityType: 'WAREHOUSE_STORAGE',
                    containerInventoryKey: { in: keys },
                },
                select: { containerInventoryKey: true },
            })
            : [];
        const inStorageSet = new Set((inStorageRows || []).map((x) => cleanString(x?.containerInventoryKey)).filter(Boolean));
        const historySet = new Set([
            ...Array.from(inStorageSet.values()),
            ...(historyOps || [])
                .map((x) => cleanString(x?.containerInventoryKey))
                .filter(Boolean),
        ]);
        return rows.map((r) => {
            const inventoryKey = cleanString(r.inventoryKey);
            return {
                ...this.toResponse(r, latestByKey.get(inventoryKey)),
                storageLocked: historySet.has(inventoryKey),
                inStorage: inStorageSet.has(inventoryKey),
            };
        });
    }
    async create(createdBy, data) {
        const addr = cleanString(createdBy);
        const inventoryKey = cleanString(data.inventoryKey);
        const txHash = cleanString(data.txHash);
        const participants = this.buildParticipants(data);
        const row = await this.prisma.container.create({
            data: {
                traceSchemeRef: cleanString(data.traceSchemeRef),
                inventoryKey,
                code: cleanString(data.code) || makeContainerCode(Date.now() % 1000),
                productionInventoryKey: cleanString(data.productionInventoryKey),
                registeringCustodianAddress: addr,
                batchId: cleanString(data.batchId) || null,
                containerType: cleanString(data.containerType) || null,
                weightPerBoxKg: cleanString(data.weightPerBoxKg) || null,
                productName: cleanString(data.productName) || null,
                participantWalletAddresses: JSON.stringify(participants.wallets),
                participantLocationLabels: participants.locations.join('; '),
                note: cleanString(data.note) || null,
                status: 'CREATE',
            },
        });
        await this.prisma.recordOperation.create({
            data: {
                entityType: ENTITY_TYPE,
                entityKey: inventoryKey,
                containerInventoryKey: inventoryKey,
                opType: 'CREATE',
                txHash,
                verified: false,
                verifiedAt: null,
                payload: {
                    participantWalletAddresses: participants.wallets,
                    participantLocationLabels: participants.locations,
                    verifiedWalletAddresses: participants.wallets,
                },
            },
        });
        const fresh = await this.prisma.container.findUnique({
            where: { inventoryKey },
        });
        return this.toResponse(fresh || row, undefined, txHash);
    }
    async update(createdBy, inventoryKey, data) {
        const key = decodeURIComponent(cleanString(inventoryKey));
        await this.assertContainerMutable(key);
        const existing = await this.prisma.container.findUnique({
            where: { inventoryKey: key },
        });
        if (!existing)
            throw new common_1.NotFoundException('Không tìm thấy thùng.');
        const nextStatus = cleanString(data.status || existing.status).toUpperCase();
        const participants = this.buildParticipants(data);
        const patch = {
            status: nextStatus,
            participantWalletAddresses: JSON.stringify(participants.wallets),
            participantLocationLabels: participants.locations.join('; '),
        };
        if (data.note !== undefined)
            patch.note = cleanString(data.note) || null;
        if (data.containerType !== undefined)
            patch.containerType = cleanString(data.containerType) || null;
        if (data.weightPerBoxKg !== undefined)
            patch.weightPerBoxKg = cleanString(data.weightPerBoxKg) || null;
        if (data.productName !== undefined)
            patch.productName = cleanString(data.productName) || null;
        const updated = await this.prisma.container.update({
            where: { inventoryKey: key },
            data: patch,
        });
        const txHash = cleanString(data.txHash);
        if (txHash) {
            await this.prisma.recordOperation.create({
                data: {
                    entityType: ENTITY_TYPE,
                    entityKey: key,
                    containerInventoryKey: key,
                    opType: 'UPDATE',
                    txHash,
                    verified: false,
                    verifiedAt: null,
                    payload: {
                        participantWalletAddresses: participants.wallets,
                        participantLocationLabels: participants.locations,
                        verifiedWalletAddresses: participants.wallets,
                    },
                },
            });
        }
        const latest = txHash ? null : await this.getLatestOp(key);
        const fresh = await this.prisma.container.findUnique({
            where: { inventoryKey: key },
        });
        return this.toResponse(fresh || updated, latest, txHash || undefined);
    }
    async deleteByInventoryKey(_createdBy, _roleRaw, inventoryKeyRaw, txHashRaw) {
        const key = cleanString(inventoryKeyRaw);
        await this.assertContainerMutable(key);
        const txHash = cleanString(txHashRaw);
        const existing = await this.prisma.container.findUnique({ where: { inventoryKey: key } });
        if (!existing)
            throw new common_1.NotFoundException('Không tìm thấy thùng.');
        await this.prisma.recordOperation.create({
            data: {
                entityType: ENTITY_TYPE,
                entityKey: key,
                containerInventoryKey: key,
                opType: 'DELETE',
                txHash,
                verified: false,
                verifiedAt: null,
            },
        });
        return { inventoryKey: key, pendingDelete: true };
    }
};
exports.ContainerService = ContainerService;
exports.ContainerService = ContainerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContainerService);
//# sourceMappingURL=container.service.js.map