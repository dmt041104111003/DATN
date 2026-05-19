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
var RecordOperationVerifierService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordOperationVerifierService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const blockfrost_js_1 = require("@blockfrost/blockfrost-js");
const prisma_service_1 = require("../prisma/prisma.service");
let RecordOperationVerifierService = RecordOperationVerifierService_1 = class RecordOperationVerifierService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RecordOperationVerifierService_1.name);
        this.blockfrost = null;
    }
    getBlockfrost() {
        if (this.blockfrost)
            return this.blockfrost;
        const apiKey = String(process.env.BLOCKFROST_API_KEY || '').trim();
        if (!apiKey)
            throw new Error('Chưa cấu hình BLOCKFROST_API_KEY trên server.');
        const networkRaw = String(process.env.APP_NETWORK || 'preprod').trim().toLowerCase();
        const network = networkRaw === 'mainnet' ? 'mainnet' : networkRaw === 'preview' ? 'preview' : 'preprod';
        this.blockfrost = new blockfrost_js_1.BlockFrostAPI({ projectId: apiKey, network });
        return this.blockfrost;
    }
    async isTxConfirmed(txHashRaw) {
        const txHash = String(txHashRaw || '').trim();
        if (!txHash)
            return false;
        try {
            const utxos = await this.getBlockfrost().txsUtxos(txHash);
            const outputs = Array.isArray(utxos?.outputs) ? utxos.outputs : [];
            for (let i = 0; i < outputs.length; i += 1) {
                if (String(outputs[i]?.inline_datum || '').trim())
                    return true;
            }
            return false;
        }
        catch (e) {
            const status = Number(e?.status_code ?? e?.status ?? 0);
            if (status === 404)
                return false;
            throw e;
        }
    }
    async tryAdvisoryLock(key) {
        try {
            const rows = await this.prisma.$queryRaw `
        SELECT pg_try_advisory_lock(${key}) as locked
      `;
            return Boolean(rows?.[0]?.locked);
        }
        catch {
            return false;
        }
    }
    async advisoryUnlock(key) {
        try {
            await this.prisma.$queryRaw `
        SELECT pg_advisory_unlock(${key})
      `;
        }
        catch { }
    }
    async markUnconfirmed(ids, attemptsById) {
        if (!ids.length)
            return;
        const now = new Date();
        await Promise.all(ids.map((id) => this.prisma.recordOperation.update({
            where: { id },
            data: {
                attempts: (attemptsById.get(id) || 0) + 1,
                lastCheckedAt: now,
            },
        })));
    }
    async markConfirmed(ops) {
        if (!ops.length)
            return;
        const now = new Date();
        await Promise.all(ops.map((op) => this.prisma.recordOperation.update({
            where: { id: String(op.id) },
            data: {
                verified: true,
                verifiedAt: now,
                lastCheckedAt: now,
                lastError: null,
                attempts: Number(op.attempts || 0) + 1,
            },
        })));
        for (let i = 0; i < ops.length; i += 1) {
            const op = ops[i];
            const opType = String(op.opType || '').trim().toUpperCase();
            if (opType !== 'DELETE')
                continue;
            const entityType = String(op.entityType || '').trim();
            const entityKey = String(op.entityKey || '').trim();
            try {
                if (entityType === 'PRODUCTION') {
                    await this.prisma.production.delete({ where: { inventoryKey: entityKey } });
                }
                if (entityType === 'CONTAINER') {
                    await this.prisma.container.delete({ where: { inventoryKey: entityKey } });
                }
            }
            catch (cleanupError) {
                const cleanupMsg = cleanupError?.message ? String(cleanupError.message) : 'cleanup failed';
                this.logger.debug(`[cleanup ${entityType}:${entityKey}] ${cleanupMsg}`);
            }
        }
    }
    async verifyPendingNow() {
        await this.tickInternal();
    }
    async tick() {
        const lockKey = BigInt(830101);
        const locked = await this.tryAdvisoryLock(lockKey);
        if (!locked)
            return;
        try {
            await this.tickInternal();
        }
        finally {
            await this.advisoryUnlock(lockKey);
        }
    }
    async tickInternal() {
        const ops = await this.prisma.recordOperation.findMany({
            where: { verified: false },
            orderBy: { createdAt: 'asc' },
            take: 100,
        });
        if (!Array.isArray(ops) || ops.length === 0)
            return;
        const byTxHash = new Map();
        for (let i = 0; i < ops.length; i += 1) {
            const op = ops[i];
            const txHash = String(op.txHash || '').trim();
            if (!txHash)
                continue;
            const bucket = byTxHash.get(txHash) || [];
            bucket.push(op);
            byTxHash.set(txHash, bucket);
        }
        const txHashes = Array.from(byTxHash.keys());
        await Promise.all(txHashes.map(async (txHash) => {
            const txOps = byTxHash.get(txHash) || [];
            if (!txOps.length)
                return;
            const attemptsById = new Map();
            for (let i = 0; i < txOps.length; i += 1) {
                const id = String(txOps[i].id || '').trim();
                if (id)
                    attemptsById.set(id, Number(txOps[i].attempts || 0));
            }
            try {
                const confirmed = await this.isTxConfirmed(txHash);
                if (!confirmed) {
                    await this.markUnconfirmed(txOps.map((op) => String(op.id)).filter(Boolean), attemptsById);
                    return;
                }
                await this.markConfirmed(txOps);
            }
            catch (e) {
                const msg = e?.message ? String(e.message) : 'verify failed';
                this.logger.debug(`[tx:${txHash}] ${msg}`);
                const now = new Date();
                await Promise.all(txOps.map((op) => this.prisma.recordOperation.update({
                    where: { id: String(op.id) },
                    data: {
                        attempts: Number(op.attempts || 0) + 1,
                        lastCheckedAt: now,
                        lastError: msg,
                    },
                })));
            }
        }));
    }
};
exports.RecordOperationVerifierService = RecordOperationVerifierService;
__decorate([
    (0, schedule_1.Cron)('*/2 * * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecordOperationVerifierService.prototype, "tick", null);
exports.RecordOperationVerifierService = RecordOperationVerifierService = RecordOperationVerifierService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecordOperationVerifierService);
//# sourceMappingURL=record-operation.verifier.service.js.map