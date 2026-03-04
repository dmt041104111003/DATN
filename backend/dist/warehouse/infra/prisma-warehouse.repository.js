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
exports.PrismaWarehouseRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PrismaWarehouseRepository = class PrismaWarehouseRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listInventoryByProfileId(profileId) {
        const rows = await this.prisma.warehouseInventory.findMany({
            where: { profileId, status: "IN_WAREHOUSE" },
            include: {
                batch: {
                    select: { id: true, name: true, image: true, policyId: true },
                },
            },
            orderBy: { receivedAt: "desc" },
        });
        const visible = (rows || []).filter((inv) => { var _a; return String((_a = inv === null || inv === void 0 ? void 0 : inv.status) !== null && _a !== void 0 ? _a : "IN_WAREHOUSE") !== "BURNED"; });
        return visible.map((inv) => {
            var _a, _b, _c, _d, _e, _f, _g;
            return ({
                batchId: inv.batchId,
                batchName: (_b = (_a = inv.batch) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : inv.batchId,
                image: (_d = (_c = inv.batch) === null || _c === void 0 ? void 0 : _c.image) !== null && _d !== void 0 ? _d : null,
                receivedAt: inv.receivedAt,
                policyId: (_f = (_e = inv.batch) === null || _e === void 0 ? void 0 : _e.policyId) !== null && _f !== void 0 ? _f : null,
                status: (_g = inv.status) !== null && _g !== void 0 ? _g : "IN_WAREHOUSE",
            });
        });
    }
    async removeInventoryForProfile(profileId, batchId) {
        await this.prisma.warehouseInventory.deleteMany({
            where: { batchId, profileId },
        });
    }
    async markAsShippedForProfile(profileId, batchId) {
        await this.prisma.warehouseInventory.updateMany({
            where: { batchId, profileId },
            data: { status: "ON_WAY", shippedAt: new Date(), lastMovedAt: new Date() },
        });
    }
    async markAsBurnedForProfile(profileId, batchId, burnTxHash) {
        await this.prisma.warehouseInventory.updateMany({
            where: { batchId, profileId },
            data: {
                status: "CONSUMED",
                consumedAt: new Date(),
                burnTxHash: burnTxHash !== null && burnTxHash !== void 0 ? burnTxHash : null,
                lastMovedAt: new Date(),
            },
        });
    }
    async addToWarehouseForProfile(profileId, batchId) {
        await this.prisma.warehouseInventory.upsert({
            where: { batchId_profileId: { batchId, profileId } },
            create: { batchId, profileId, status: "IN_WAREHOUSE" },
            update: { status: "IN_WAREHOUSE", shippedAt: null, lastMovedAt: new Date() },
        });
    }
    async findRecipientByRoadmap(profileId, batchId) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const prisma = this.prisma;
        const bid = (batchId || "").trim();
        if (!bid)
            return { recipientAddress: null };
        const profile = await prisma.profile.findUnique({
            where: { id: profileId },
            select: { walletAddress: true },
        });
        if (!(profile === null || profile === void 0 ? void 0 : profile.walletAddress))
            return { recipientAddress: null };
        const senderWallet = profile.walletAddress.trim().toLowerCase();
        const batch = await prisma.productBatch.findUnique({
            where: { batchId: bid },
            select: {
                minterProfileId: true,
                minterProfile: { select: { walletAddress: true } },
            },
        });
        if (!batch)
            return { recipientAddress: null };
        const minterWallet = (_c = (_b = (_a = batch.minterProfile) === null || _a === void 0 ? void 0 : _a.walletAddress) === null || _b === void 0 ? void 0 : _b.trim().toLowerCase()) !== null && _c !== void 0 ? _c : "";
        if (minterWallet && senderWallet === minterWallet) {
            const firstHop = await prisma.roadmap.findFirst({
                where: { batchId: bid },
                orderBy: { stepIndex: "asc" },
                select: { toAddress: true },
            });
            return {
                recipientAddress: (_e = (_d = firstHop === null || firstHop === void 0 ? void 0 : firstHop.toAddress) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : null,
            };
        }
        const myHop = await prisma.roadmap.findMany({
            where: { batchId: bid },
            orderBy: { stepIndex: "asc" },
            select: { stepIndex: true, toAddress: true },
        });
        const idx = myHop.findIndex((r) => (r.toAddress || "").trim().toLowerCase() === senderWallet);
        if (idx < 0 || idx >= myHop.length - 1)
            return { recipientAddress: null };
        const next = (_h = (_g = (_f = myHop[idx + 1]) === null || _f === void 0 ? void 0 : _f.toAddress) === null || _g === void 0 ? void 0 : _g.trim()) !== null && _h !== void 0 ? _h : null;
        return { recipientAddress: next };
    }
};
exports.PrismaWarehouseRepository = PrismaWarehouseRepository;
exports.PrismaWarehouseRepository = PrismaWarehouseRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaWarehouseRepository);
//# sourceMappingURL=prisma-warehouse.repository.js.map