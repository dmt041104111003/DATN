import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

type OperationRow = {
  id: string;
  entityType: string;
  entityKey: string;
  opType: string;
  txHash: string;
  verified: boolean;
};

@Injectable()
export class RecordOperationVerifierService {
  private readonly logger = new Logger(RecordOperationVerifierService.name);

  constructor(private readonly prisma: PrismaService) {}

  private resolveBlockfrostBaseUrl(): string {
    const network = (process.env.APP_NETWORK || 'preprod').trim().toLowerCase();
    if (network === 'mainnet') return 'https://cardano-mainnet.blockfrost.io/api/v0';
    if (network === 'preview') return 'https://cardano-preview.blockfrost.io/api/v0';
    return 'https://cardano-preprod.blockfrost.io/api/v0';
  }

  private getBlockfrostApiKey(): string {
    const key = (process.env.BLOCKFROST_API_KEY || '').trim();
    if (!key) throw new Error('BLOCKFROST_API_KEY is not set');
    return key;
  }

  private async isTxConfirmed(txHash: string): Promise<boolean> {
    const hash = (txHash || '').trim();
    if (!hash) return false;
    const url = `${this.resolveBlockfrostBaseUrl()}/txs/${encodeURIComponent(hash)}`;
    const res = await fetch(url, {
      headers: { project_id: this.getBlockfrostApiKey() },
    });
    if (res.status === 200) return true;
    if (res.status === 404) return false;
    const body = await res.text().catch(() => '');
    throw new Error(body || 'Unable to verify the record yet.');
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
      const ops: OperationRow[] = await (this.prisma as any).recordOperation.findMany({
        where: { verified: false },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });

      if (!Array.isArray(ops) || ops.length === 0) return;

      for (const op of ops) {
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
              if (entityType === 'PACKAGE') {
                await (this.prisma as any).package.delete({
                  where: { inventoryKey: entityKey },
                });
              } else if (entityType === 'PRODUCTION') {
                await (this.prisma as any).production.delete({
                  where: { inventoryKey: entityKey },
                });
              } else if (entityType === 'SHIPMENT') {
                await (this.prisma as any).shipment.delete({
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

