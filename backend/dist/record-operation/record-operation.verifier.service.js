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
const prisma_service_1 = require("../prisma/prisma.service");
let RecordOperationVerifierService = RecordOperationVerifierService_1 = class RecordOperationVerifierService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RecordOperationVerifierService_1.name);
    }
    baseUrl() {
        const network = String(process.env.APP_NETWORK || 'preprod').trim().toLowerCase();
        if (network === 'mainnet')
            return 'https://cardano-mainnet.blockfrost.io/api/v0';
        if (network === 'preview')
            return 'https://cardano-preview.blockfrost.io/api/v0';
        return 'https://cardano-preprod.blockfrost.io/api/v0';
    }
    apiKey() {
        const key = String(process.env.BLOCKFROST_API_KEY || '').trim();
        if (!key)
            throw new Error('BLOCKFROST_API_KEY is not set');
        return key;
    }
    async isTxConfirmed(txHashRaw) {
        const txHash = String(txHashRaw || '').trim();
        if (!txHash)
            return false;
        const headers = { project_id: this.apiKey() };
        const txRes = await fetch(`${this.baseUrl()}/txs/${encodeURIComponent(txHash)}`, { headers });
        if (txRes.status === 404)
            return false;
        if (txRes.status !== 200)
            throw new Error((await txRes.text().catch(() => '')) || 'Unable to verify tx yet.');
        const utxoRes = await fetch(`${this.baseUrl()}/txs/${encodeURIComponent(txHash)}/utxos`, { headers });
        if (utxoRes.status === 404)
            return false;
        if (utxoRes.status !== 200)
            throw new Error((await utxoRes.text().catch(() => '')) || 'Unable to read tx utxos yet.');
        const utxos = await utxoRes.json().catch(() => null);
        const outputs = Array.isArray(utxos?.outputs) ? utxos.outputs : [];
        for (let i = 0; i < outputs.length; i += 1) {
            if (String(outputs[i]?.inline_datum || '').trim())
                return true;
        }
        return false;
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
        catch {
        }
    }
    async tick() {
        const lockKey = BigInt(830101);
        const locked = await this.tryAdvisoryLock(lockKey);
        if (!locked)
            return;
        try {
            const ops = await this.prisma.recordOperation.findMany({
                where: { verified: false },
                orderBy: { createdAt: 'asc' },
                take: 50,
            });
            if (!Array.isArray(ops) || ops.length === 0)
                return;
            for (let i = 0; i < ops.length; i += 1) {
                const op = ops[i];
                const id = String(op.id || '').trim();
                const entityType = String(op.entityType || '').trim();
                const entityKey = String(op.entityKey || '').trim();
                const opType = String(op.opType || '').trim().toUpperCase();
                const txHash = String(op.txHash || '').trim();
                if (!id || !entityType || !entityKey || !opType || !txHash)
                    continue;
                try {
                    const confirmed = await this.isTxConfirmed(txHash);
                    const attempts = Number(op.attempts || 0) + 1;
                    if (!confirmed) {
                        await this.prisma.recordOperation.update({
                            where: { id },
                            data: { attempts, lastCheckedAt: new Date() },
                        });
                        continue;
                    }
                    await this.prisma.recordOperation.update({
                        where: { id },
                        data: {
                            verified: true,
                            verifiedAt: new Date(),
                            attempts,
                            lastCheckedAt: new Date(),
                            lastError: null,
                        },
                    });
                    if (opType === 'DELETE') {
                        try {
                            if (entityType === 'PRODUCTION') {
                                await this.prisma.production.delete({
                                    where: { inventoryKey: entityKey },
                                });
                            }
                            if (entityType === 'CONTAINER') {
                                await this.prisma.container.delete({
                                    where: { inventoryKey: entityKey },
                                });
                            }
                        }
                        catch (cleanupError) {
                            const cleanupMsg = cleanupError?.message ? String(cleanupError.message) : 'cleanup failed';
                            this.logger.debug(`[cleanup ${entityType}:${entityKey}] ${cleanupMsg}`);
                        }
                    }
                }
                catch (e) {
                    const msg = e?.message ? String(e.message) : 'verify failed';
                    this.logger.debug(`[${entityType}:${entityKey}] ${msg}`);
                    try {
                        await this.prisma.recordOperation.update({
                            where: { id },
                            data: {
                                attempts: Number(op.attempts || 0) + 1,
                                lastCheckedAt: new Date(),
                                lastError: msg,
                            },
                        });
                    }
                    catch {
                    }
                }
            }
        }
        finally {
            await this.advisoryUnlock(lockKey);
        }
    }
};
exports.RecordOperationVerifierService = RecordOperationVerifierService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecordOperationVerifierService.prototype, "tick", null);
exports.RecordOperationVerifierService = RecordOperationVerifierService = RecordOperationVerifierService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecordOperationVerifierService);
//# sourceMappingURL=record-operation.verifier.service.js.map