import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecordOperationVerifierService {
  private readonly logger = new Logger(RecordOperationVerifierService.name);

  constructor(private readonly prisma: PrismaService) {}

  private baseUrl() {
    const network = String(process.env.APP_NETWORK || 'preprod').trim().toLowerCase();
    if (network === 'mainnet') return 'https://cardano-mainnet.blockfrost.io/api/v0';
    if (network === 'preview') return 'https://cardano-preview.blockfrost.io/api/v0';
    return 'https://cardano-preprod.blockfrost.io/api/v0';
  }

  private apiKey() {
    const key = String(process.env.BLOCKFROST_API_KEY || '').trim();
    if (!key) throw new Error('BLOCKFROST_API_KEY is not set');
    return key;
  }

  private async isTxConfirmed(txHashRaw: unknown): Promise<boolean> {
    const txHash = String(txHashRaw || '').trim();
    if (!txHash) return false;
    const headers = { project_id: this.apiKey() };

    const txRes = await fetch(`${this.baseUrl()}/txs/${encodeURIComponent(txHash)}`, { headers });
    if (txRes.status === 404) return false;
    if (txRes.status !== 200) throw new Error((await txRes.text().catch(() => '')) || 'Unable to verify tx yet.');

    const utxoRes = await fetch(`${this.baseUrl()}/txs/${encodeURIComponent(txHash)}/utxos`, { headers });
    if (utxoRes.status === 404) return false;
    if (utxoRes.status !== 200) throw new Error((await utxoRes.text().catch(() => '')) || 'Unable to read tx utxos yet.');

    const utxos = await utxoRes.json().catch(() => null);
    const outputs = Array.isArray(utxos?.outputs) ? utxos.outputs : [];
    for (let i = 0; i < outputs.length; i += 1) {
      if (String(outputs[i]?.inline_datum || '').trim()) return true;
    }
    return false;
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
    } catch {
      // ignore
    }
  }

  @Cron('*/5 * * * * *')
  async tick() {
    const lockKey = BigInt(830101);
    const locked = await this.tryAdvisoryLock(lockKey);
    if (!locked) return;

    try {
      const ops = await (this.prisma as any).recordOperation.findMany({
        where: { verified: false },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });

      if (!Array.isArray(ops) || ops.length === 0) return;

      for (let i = 0; i < ops.length; i += 1) {
        const op = ops[i];
        const id = String(op.id || '').trim();
        const entityType = String(op.entityType || '').trim();
        const entityKey = String(op.entityKey || '').trim();
        const opType = String(op.opType || '').trim().toUpperCase();
        const txHash = String(op.txHash || '').trim();
        if (!id || !entityType || !entityKey || !opType || !txHash) continue;

        try {
          const confirmed = await this.isTxConfirmed(txHash);
          const attempts = Number((op as any).attempts || 0) + 1;
          if (!confirmed) {
            await (this.prisma as any).recordOperation.update({
              where: { id },
              data: { attempts, lastCheckedAt: new Date() } as any,
            });
            continue;
          }

          await (this.prisma as any).recordOperation.update({
            where: { id },
            data: {
              verified: true,
              verifiedAt: new Date(),
              attempts,
              lastCheckedAt: new Date(),
              lastError: null,
            } as any,
          });

          if (opType === 'DELETE') {
            try {
              if (entityType === 'PRODUCTION') {
                await (this.prisma as any).production.delete({
                  where: { inventoryKey: entityKey },
                });
              }
              if (entityType === 'CONTAINER') {
                await (this.prisma as any).container.delete({
                  where: { inventoryKey: entityKey },
                });
              }
            } catch (cleanupError: any) {
              const cleanupMsg = cleanupError?.message ? String(cleanupError.message) : 'cleanup failed';
              this.logger.debug(`[cleanup ${entityType}:${entityKey}] ${cleanupMsg}`);
            }
          }

        } catch (e: any) {
          const msg = e?.message ? String(e.message) : 'verify failed';
          this.logger.debug(`[${entityType}:${entityKey}] ${msg}`);
          try {
            await (this.prisma as any).recordOperation.update({
              where: { id },
              data: {
                attempts: Number((op as any).attempts || 0) + 1,
                lastCheckedAt: new Date(),
                lastError: msg,
              } as any,
            });
          } catch {
            // ignore
          }
        }
      }
    } finally {
      await this.advisoryUnlock(lockKey);
    }
  }
}

