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
exports.WarehouseStorageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ENTITY_TYPE = 'WAREHOUSE_STORAGE';
function cleanString(v) {
    return String(v ?? '').trim();
}
let WarehouseStorageService = class WarehouseStorageService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async writeOperation(opType, txHashRaw, storageId, containerInventoryKey, payload) {
        const txHash = cleanString(txHashRaw);
        if (!txHash)
            return;
        await this.prisma.recordOperation.create({
            data: {
                entityType: ENTITY_TYPE,
                entityKey: storageId,
                opType,
                txHash,
                verified: false,
                verifiedAt: null,
                containerInventoryKey: cleanString(containerInventoryKey) || null,
                payload: payload || null,
            },
        });
    }
    async list(createdBy) {
        const custodian = cleanString(createdBy);
        const rows = await this.prisma.warehouseStorage.findMany({
            where: {
                warehouse: { registeringCustodianAddress: custodian },
            },
            orderBy: { createdAt: 'desc' },
            include: {
                warehouse: { select: { id: true, name: true } },
                container: { select: { inventoryKey: true, code: true } },
            },
        });
        const entityKeys = rows.map((row) => cleanString(row?.id)).filter(Boolean);
        const ops = entityKeys.length
            ? await this.prisma.recordOperation.findMany({
                where: {
                    entityType: ENTITY_TYPE,
                    entityKey: { in: entityKeys },
                },
                orderBy: { createdAt: 'desc' },
                select: { entityKey: true, verified: true, verifiedAt: true },
            })
            : [];
        const latestOpByEntityKey = new Map();
        for (const op of ops) {
            const key = cleanString(op?.entityKey);
            if (!key || latestOpByEntityKey.has(key))
                continue;
            latestOpByEntityKey.set(key, op);
        }
        return rows.map((row) => ({
            ...row,
            warehouseName: cleanString(row?.warehouse?.name),
            containerCode: cleanString(row?.container?.code),
            verified: Boolean(latestOpByEntityKey.get(cleanString(row?.id))?.verified),
            verifiedAt: latestOpByEntityKey.get(cleanString(row?.id))?.verifiedAt || null,
        }));
    }
    async create(createdBy, data) {
        const custodian = cleanString(createdBy);
        const warehouseId = cleanString(data?.warehouseId);
        const containerInventoryKey = cleanString(data?.containerInventoryKey || data?.productId);
        const warehouse = await this.prisma.warehouse.findFirst({
            where: { id: warehouseId, registeringCustodianAddress: custodian },
            select: { id: true },
        });
        if (!warehouse)
            throw new common_1.NotFoundException('Warehouse not found');
        const container = await this.prisma.container.findUnique({
            where: { inventoryKey: containerInventoryKey },
            select: { inventoryKey: true, status: true },
        });
        if (!container)
            throw new common_1.NotFoundException('Thùng hàng không tồn tại');
        if (cleanString(container?.status).toUpperCase() === 'CONSUMED') {
            throw new common_1.ConflictException('Thùng hàng đã tiêu thụ, không thể nhập kho lại.');
        }
        const duplicated = await this.prisma.warehouseStorage.findFirst({
            where: { containerInventoryKey },
            select: { id: true },
        });
        if (duplicated) {
            throw new common_1.ConflictException('Thùng hàng đang ở trong kho lưu trữ, cần xuất kho trước khi nhập kho mới.');
        }
        const row = await this.prisma.warehouseStorage.create({
            data: {
                warehouseId,
                containerInventoryKey,
                conditions: cleanString(data?.conditions) || null,
            },
        });
        const location = cleanString(data?.location);
        if (location) {
            await this.prisma.container.update({
                where: { inventoryKey: containerInventoryKey },
                data: { location },
            });
        }
        await this.writeOperation('CREATE', data?.txHash, cleanString(row?.id), containerInventoryKey, {
            warehouseId,
            storageTime: new Date().toISOString(),
            conditions: cleanString(data?.conditions) || null,
        });
        return row;
    }
    async update(createdBy, idRaw, data) {
        const custodian = cleanString(createdBy);
        const id = cleanString(idRaw);
        const existing = await this.prisma.warehouseStorage.findFirst({
            where: {
                id,
                warehouse: { registeringCustodianAddress: custodian },
            },
            select: { id: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Warehouse storage not found');
        const patch = {};
        if (data?.warehouseId !== undefined)
            patch.warehouseId = cleanString(data?.warehouseId);
        if (data?.containerInventoryKey !== undefined || data?.productId !== undefined) {
            patch.containerInventoryKey = cleanString(data?.containerInventoryKey || data?.productId);
        }
        if (data?.conditions !== undefined)
            patch.conditions = cleanString(data?.conditions) || null;
        const nextContainerInventoryKey = cleanString(patch.containerInventoryKey ?? (data?.containerInventoryKey || data?.productId));
        if (nextContainerInventoryKey) {
            const targetContainer = await this.prisma.container.findUnique({
                where: { inventoryKey: nextContainerInventoryKey },
                select: { status: true },
            });
            if (cleanString(targetContainer?.status).toUpperCase() === 'CONSUMED') {
                throw new common_1.ConflictException('Thùng hàng đã tiêu thụ, không thể nhập kho lại.');
            }
            const duplicated = await this.prisma.warehouseStorage.findFirst({
                where: {
                    containerInventoryKey: nextContainerInventoryKey,
                    id: { not: id },
                },
                select: { id: true },
            });
            if (duplicated) {
                throw new common_1.ConflictException('Thùng hàng đang ở trong kho lưu trữ, cần xuất kho trước khi nhập kho mới.');
            }
        }
        const row = await this.prisma.warehouseStorage.update({
            where: { id },
            data: patch,
        });
        await this.writeOperation('UPDATE', data?.txHash, id, cleanString(row?.containerInventoryKey || data?.containerInventoryKey || data?.productId), {
            warehouseId: cleanString(row?.warehouseId || data?.warehouseId),
            storageTime: new Date().toISOString(),
            conditions: cleanString(row?.conditions),
        });
        return row;
    }
    async remove(createdBy, roleRaw, idRaw, data) {
        const custodian = cleanString(createdBy);
        const role = cleanString(roleRaw).toUpperCase();
        const isAgent = role === 'AGENT';
        const id = cleanString(idRaw);
        const existing = await this.prisma.warehouseStorage.findFirst({
            where: {
                id,
                warehouse: { registeringCustodianAddress: custodian },
            },
            select: { id: true, containerInventoryKey: true, warehouseId: true, conditions: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Warehouse storage not found');
        const container = await this.prisma.container.findUnique({
            where: { inventoryKey: cleanString(existing?.containerInventoryKey) },
            select: { status: true },
        });
        if (cleanString(container?.status).toUpperCase() === 'CONSUMED') {
            throw new common_1.ConflictException('Thùng hàng đã tiêu thụ trước đó.');
        }
        await this.writeOperation(isAgent ? 'CONSUME' : 'DELETE', data?.txHash, id, cleanString(existing?.containerInventoryKey), {
            warehouseId: cleanString(existing?.warehouseId),
            storageTime: new Date().toISOString(),
            conditions: cleanString(existing?.conditions),
        });
        if (isAgent) {
            await this.prisma.container.update({
                where: { inventoryKey: cleanString(existing?.containerInventoryKey) },
                data: { status: 'CONSUMED' },
            });
        }
        await this.prisma.warehouseStorage.delete({
            where: { id },
        });
        return { id, deleted: true, txHash: cleanString(data?.txHash) || null };
    }
};
exports.WarehouseStorageService = WarehouseStorageService;
exports.WarehouseStorageService = WarehouseStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarehouseStorageService);
//# sourceMappingURL=warehouse-storage.service.js.map