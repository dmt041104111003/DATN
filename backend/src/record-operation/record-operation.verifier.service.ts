import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecordOperationVerifierService {
  private readonly logger = new Logger(RecordOperationVerifierService.name);
  private blockfrost: BlockFrostAPI | null = null;

  constructor(private readonly prisma: PrismaService) {}

  private getBlockfrost(): BlockFrostAPI {
    if (this.blockfrost) return this.blockfrost;
    const apiKey = String(process.env.BLOCKFROST_API_KEY || '').trim();
    if (!apiKey) throw new Error('Chưa cấu hình BLOCKFROST_API_KEY trên server.');
    const networkRaw = String(process.env.APP_NETWORK || 'preprod').trim().toLowerCase();
    const network =
      networkRaw === 'mainnet' ? 'mainnet' : networkRaw === 'preview' ? 'preview' : 'preprod';
    this.blockfrost = new BlockFrostAPI({ projectId: apiKey, network });
    return this.blockfrost;
  }

  private async isTxConfirmed(txHashRaw: unknown): Promise<boolean> {
    const txHash = String(txHashRaw || '').trim();
    if (!txHash) return false;
    try {
      const utxos = await this.getBlockfrost().txsUtxos(txHash);
      const outputs = Array.isArray(utxos?.outputs) ? utxos.outputs : [];
      for (let i = 0; i < outputs.length; i += 1) {
        if (String(outputs[i]?.inline_datum || '').trim()) return true;
      }
      return false;
    } catch (e: any) {
      const status = Number(e?.status_code ?? e?.status ?? 0);
      if (status === 404) return false;
      throw e;
    }
  }

  private async tryAdvisoryLock(key: bigint): Promise<boolean> {
    try {
      const rows = await (this.prisma as any).$queryRaw`
        SELECT pg_try_advisory_lock(${key}) as locked
      `;
      return Boolean(rows?.[0]?.locked);
    } catch {
      return false;
    }
  }

  private async advisoryUnlock(key: bigint): Promise<void> {
    try {
      await (this.prisma as any).$queryRaw`
        SELECT pg_advisory_unlock(${key})
      `;
    } catch {}
  }

  private async markUnconfirmed(ids: string[], attemptsById: Map<string, number>) {
    if (!ids.length) return;
    const now = new Date();
    await Promise.all(
      ids.map((id) =>
        (this.prisma as any).recordOperation.update({
          where: { id },
          data: {
            attempts: (attemptsById.get(id) || 0) + 1,
            lastCheckedAt: now,
          } as any,
        }),
      ),
    );
  }

  private async markConfirmed(ops: any[]) {
    if (!ops.length) return;
    const now = new Date();
    await Promise.all(
      ops.map((op) =>
        (this.prisma as any).recordOperation.update({
          where: { id: String(op.id) },
          data: {
            verified: true,
            verifiedAt: now,
            lastCheckedAt: now,
            lastError: null,
            attempts: Number(op.attempts || 0) + 1,
          } as any,
        }),
      ),
    );

    for (let i = 0; i < ops.length; i += 1) {
      const op = ops[i];
      const opType = String(op.opType || '').trim().toUpperCase();
      if (opType !== 'DELETE') continue;
      const entityType = String(op.entityType || '').trim();
      const entityKey = String(op.entityKey || '').trim();
      try {
        if (entityType === 'PRODUCTION') {
          await (this.prisma as any).production.delete({ where: { inventoryKey: entityKey } });
        }
        if (entityType === 'CONTAINER') {
          await (this.prisma as any).container.delete({ where: { inventoryKey: entityKey } });
        }
      } catch (cleanupError: any) {
        const cleanupMsg = cleanupError?.message ? String(cleanupError.message) : 'cleanup failed';
        this.logger.debug(`[cleanup ${entityType}:${entityKey}] ${cleanupMsg}`);
      }
    }
  }

  async verifyPendingNow() {
    await this.tickInternal();
  }

  @Cron('*/2 * * * * *')
  async tick() {
    const lockKey = BigInt(830101);
    const locked = await this.tryAdvisoryLock(lockKey);
    if (!locked) return;
    try {
      await this.tickInternal();
    } finally {
      await this.advisoryUnlock(lockKey);
    }
  }

  private async tickInternal() {
    const ops = await (this.prisma as any).recordOperation.findMany({
      where: { verified: false },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    if (!Array.isArray(ops) || ops.length === 0) return;

    const byTxHash = new Map<string, any[]>();
    for (let i = 0; i < ops.length; i += 1) {
      const op = ops[i];
      const txHash = String(op.txHash || '').trim();
      if (!txHash) continue;
      const bucket = byTxHash.get(txHash) || [];
      bucket.push(op);
      byTxHash.set(txHash, bucket);
    }

    const txHashes = Array.from(byTxHash.keys());
    await Promise.all(
      txHashes.map(async (txHash) => {
        const txOps = byTxHash.get(txHash) || [];
        if (!txOps.length) return;
        const attemptsById = new Map<string, number>();
        for (let i = 0; i < txOps.length; i += 1) {
          const id = String(txOps[i].id || '').trim();
          if (id) attemptsById.set(id, Number(txOps[i].attempts || 0));
        }
        try {
          const confirmed = await this.isTxConfirmed(txHash);
          if (!confirmed) {
            await this.markUnconfirmed(
              txOps.map((op) => String(op.id)).filter(Boolean),
              attemptsById,
            );
            return;
          }
          await this.markConfirmed(txOps);
        } catch (e: any) {
          const msg = e?.message ? String(e.message) : 'verify failed';
          this.logger.debug(`[tx:${txHash}] ${msg}`);
          const now = new Date();
          await Promise.all(
            txOps.map((op) =>
              (this.prisma as any).recordOperation.update({
                where: { id: String(op.id) },
                data: {
                  attempts: Number(op.attempts || 0) + 1,
                  lastCheckedAt: now,
                  lastError: msg,
                } as any,
              }),
            ),
          );
        }
      }),
    );
  }
}
