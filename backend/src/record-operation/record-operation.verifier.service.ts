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

  @Cron('*/15 * * * * *')
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

          if (opType === 'RETIRE' && entityType === 'GROWING_AREA') {
            await (this.prisma as any).growingArea.delete({ where: { inventoryKey: entityKey } });
            await (this.prisma as any).recordOperation.deleteMany({
              where: { entityType, entityKey },
            });
          }
          if (opType === 'RETIRE' && entityType === 'PLAN') {
            await (this.prisma as any).plan.delete({ where: { inventoryKey: entityKey } });
            await (this.prisma as any).recordOperation.deleteMany({
              where: { entityType, entityKey },
            });
          }
          if (opType === 'RETIRE' && entityType === 'CONTAINER') {
            await (this.prisma as any).container.delete({ where: { inventoryKey: entityKey } });
            await (this.prisma as any).recordOperation.deleteMany({
              where: { entityType, entityKey },
            });
          }
          if (
            entityType === 'CONTAINER' &&
            (opType === 'DISPATCH' || opType === 'CHECKIN' || opType === 'CONSUME' || opType === 'UPDATE')
          ) {
            const payload: any = (op as any).payload || {};
            const toStrOrNull = (v: unknown) => {
              const t = String(v ?? '').trim();
              return t ? t : null;
            };
            const data: any = {};
            if (opType === 'DISPATCH') {
              data.status = 'OUTBOUND_DISPATCH';
              data.warehouseId = null;
            }
            if (opType === 'CHECKIN') {
              const wid = toStrOrNull(payload.warehouseId);
              if (wid) data.warehouseId = wid;
              const nextStatus = String(payload.status || '').trim().toUpperCase();
              // Check-in always results in an inbound checked-in state.
              if (nextStatus === 'INBOUND_CHECKIN') data.status = 'INBOUND_CHECKIN';
              else data.status = 'INBOUND_CHECKIN';
            }
            if (opType === 'CONSUME') {
              data.status = 'CONSUMED';
              data.warehouseId = null;
            }
            if (opType === 'UPDATE') {
              data.status = 'UPDATED';
            }
            await (this.prisma as any).container.update({
              where: { inventoryKey: entityKey },
              data,
            });
          }
          if (opType === 'HARVEST' && entityType === 'PLAN') {
            const payload: any = (op as any).payload || {};
            const hasAnyHarvestPayload = Object.keys(payload).some((k) =>
              [
                'plannedHarvestDate',
                'expectedHarvestYield',
                'plannedProcessingDate',
                'expectedProcessingYield',
                'harvestImageIpfs',
              ].includes(k),
            );

            const toDateOrNull = (v: unknown) => {
              const s = v === null || typeof v === 'undefined' ? '' : String(v);
              const t = s.trim();
              if (!t) return null;
              const d = new Date(t);
              return Number.isNaN(d.getTime()) ? null : d;
            };

            const toStrOrNull = (v: unknown) => {
              const t = String(v ?? '').trim();
              return t ? t : null;
            };

            const data: any = {
              stage: 'HARVESTED',
              harvestedAt: new Date(),
            };

            if (hasAnyHarvestPayload) {
              data.plannedHarvestDate = toDateOrNull(payload.plannedHarvestDate);
              data.expectedHarvestYield = toStrOrNull(payload.expectedHarvestYield);
              data.plannedProcessingDate = toDateOrNull(payload.plannedProcessingDate);
              data.expectedProcessingYield = toStrOrNull(payload.expectedProcessingYield);
            }

            await (this.prisma as any).plan.update({
              where: { inventoryKey: entityKey },
              data: data as any,
            });
          }

          if (opType === 'PACKAGING' && entityType === 'PLAN') {
            const payload: any = (op as any).payload || {};

            const toDateOrNull = (v: unknown) => {
              const s = v === null || typeof v === 'undefined' ? '' : String(v);
              const t = s.trim();
              if (!t) return null;
              const d = new Date(t);
              return Number.isNaN(d.getTime()) ? null : d;
            };

            const toStrOrNull = (v: unknown) => {
              const t = String(v ?? '').trim();
              return t ? t : null;
            };

            await (this.prisma as any).plan.update({
              where: { inventoryKey: entityKey },
              data: {
                stage: 'PACKAGED',
                packagedAt: new Date(),
                plannedPackagingDate: toDateOrNull(payload.plannedPackagingDate),
                expectedPackagingQuantity: toStrOrNull(payload.expectedPackagingQuantity),
                expiryDate: toDateOrNull(payload.expiryDate),
                packagingSpec: toStrOrNull(payload.packagingSpec),
              } as any,
            });
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

