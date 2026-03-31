import { Injectable } from '@nestjs/common';
import { BlockFrostAPI, BlockfrostServerError } from '@blockfrost/blockfrost-js';
// Prisma client is generated at build time; keep this as a string for type stability.
type ContainerStatus = string;
import { PrismaService } from '../prisma/prisma.service';
import { deserializeDatum } from '../utils/deserialize-datum';

const POLICY_ID_HEX_LEN = 56;
const CIP68_100_PREFIX = '000643b0';
const CIP68_222_PREFIX = '000de140';

function buildNativeAssetUnitCandidates(inventoryKey: string): string[] {
  const raw = (inventoryKey || '').trim();
  if (!raw) {
    return [];
  }
  const k = raw.toLowerCase();
  const candidates: string[] = [];
  const push = (u: string) => {
    const t = u.trim().toLowerCase();
    if (t && !candidates.includes(t)) {
      candidates.push(t);
    }
  };
  push(k);
  if (/^[0-9a-f]+$/.test(k) && k.length > POLICY_ID_HEX_LEN) {
    const policy = k.slice(0, POLICY_ID_HEX_LEN);
    const rest = k.slice(POLICY_ID_HEX_LEN);
    if (
      rest.length > 0 &&
      rest.length % 2 === 0 &&
      !rest.startsWith(CIP68_100_PREFIX) &&
      !rest.startsWith(CIP68_222_PREFIX)
    ) {
      push(`${policy}${CIP68_100_PREFIX}${rest}`);
      push(`${policy}${CIP68_222_PREFIX}${rest}`);
    }
  }
  return candidates;
}

function isAssetNotFoundError(err: unknown): boolean {
  if (err instanceof BlockfrostServerError) {
    return err.status_code === 404;
  }
  return false;
}

export type HandlingMilestone =
  | 'Lot first registered'
  | 'Lot closed in circulation'
  | 'Custody handoff'
  | 'Passport refreshed'
  | 'Handling event recorded';

export interface HandlingLogEntry {
  confirmationRef: string;
  recordedAt: number;
  outcome: 'Completed';
  milestone: HandlingMilestone;
  lotPassport: Record<string, unknown>;
  recordKeepingCharge: string;
}

export interface TraceResult {
  lotPassport: Record<string, unknown>;
  handlingLog: HandlingLogEntry[];
  tracingEnded: boolean;
  lifecycleStatus?: ContainerStatus | null;
  message?: string;
}

@Injectable()
export class TraceService {
  private blockfrost: BlockFrostAPI;

  constructor(private readonly prisma: PrismaService) {
    const projectId = process.env.BLOCKFROST_API_KEY || '';
    if (!projectId) {
      throw new Error('BLOCKFROST_API_KEY is not set');
    }
    const network =
      (process.env.APP_NETWORK || process.env.BLOCKFROST_NETWORK || 'preprod')
        .toLowerCase() === 'mainnet'
        ? 'mainnet'
        : 'preprod';
    this.blockfrost = new BlockFrostAPI({
      projectId,
      network,
    });
  }

  private milestoneForFlow(
    inputQty: number,
    outputQty: number,
    inputAddress?: string,
    outputAddress?: string,
  ): HandlingMilestone {
    if (inputQty === 0 && outputQty > 0) {
      return 'Lot first registered';
    }
    if (outputQty === 0 && inputQty > 0) {
      return 'Lot closed in circulation';
    }
    if (inputQty > 0 && outputQty > 0) {
      const quantityChange = outputQty - inputQty;
      // When the asset stays on the same script address, this is usually a
      // passport refresh (datum update). When it moves to a different address,
      // we treat it as a custody handoff.
      if (inputAddress && outputAddress) {
        return inputAddress === outputAddress
          ? 'Passport refreshed'
          : 'Custody handoff';
      }

      // Fallback: if we cannot read addresses, use quantity delta.
      // (This is less accurate but better than returning the same label.)
      return quantityChange === 0 ? 'Passport refreshed' : 'Custody handoff';
    }
    return 'Handling event recorded';
  }

  private async resolveBlockfrostAssetUnit(
    inventoryKey: string,
  ): Promise<{ unit: string } | { error: TraceResult }> {
    const candidates = buildNativeAssetUnitCandidates(inventoryKey);
    if (candidates.length === 0) {
      return {
        error: {
          lotPassport: {},
          handlingLog: [],
          tracingEnded: false,
          message: 'Invalid inventory key for chain lookup.',
        },
      };
    }
    let lastErr: unknown;
    for (const unit of candidates) {
      try {
        await this.blockfrost.assetsTransactions(unit, { count: 1, page: 1 });
        return { unit };
      } catch (e) {
        lastErr = e;
        if (!isAssetNotFoundError(e)) {
          throw e;
        }
      }
    }
    return {
      error: {
        lotPassport: {},
        handlingLog: [],
        tracingEnded: false,
        message:
          lastErr instanceof Error
            ? `Blockfrost could not find this asset (tried CIP-68 unit variants). ${lastErr.message}`
            : 'Blockfrost could not find this asset for the given inventory key.',
      },
    };
  }

  private async getProductTraceInternal(inventoryKey: string): Promise<TraceResult> {
    const resolved = await this.resolveBlockfrostAssetUnit(inventoryKey);
    if ('error' in resolved) {
      return resolved.error;
    }
    const chainUnit = resolved.unit;

    const assetTxRefs = await this.blockfrost.assetsTransactions(chainUnit);
    const histories: HandlingLogEntry[] = [];

    for (const { tx_hash } of assetTxRefs) {
      try {
        const txInfo = await this.blockfrost.txs(tx_hash);
        const utxos = await this.blockfrost.txsUtxos(tx_hash);

        let inputQty = 0;
        let outputQty = 0;

        const inputWithAsset = utxos.inputs.find((input: { amount: { unit: string; quantity: string }[] }) =>
          input.amount.some((a) => a.unit === chainUnit),
        );
        if (inputWithAsset) {
          const amt = inputWithAsset.amount.find((a) => a.unit === chainUnit);
          inputQty = Number(amt?.quantity || 0);
        }

        const outputWithAsset = utxos.outputs.find((output: { amount: { unit: string; quantity: string }[] }) =>
          output.amount.some((a) => a.unit === chainUnit),
        );
        if (outputWithAsset) {
          const amt = outputWithAsset.amount.find((a) => a.unit === chainUnit);
          outputQty = Number(amt?.quantity || 0);
        }

        const inputAddress = (inputWithAsset as any)?.address;
        const outputAddress = (outputWithAsset as any)?.address;
        let milestone = this.milestoneForFlow(
          inputQty,
          outputQty,
          inputAddress,
          outputAddress,
        );

        let rawDatum: string | undefined;
        const outWithDatum = outputWithAsset as { inline_datum?: string } | undefined;
        const inWithDatum = inputWithAsset as { inline_datum?: string } | undefined;
        if (outWithDatum?.inline_datum) {
          rawDatum = outWithDatum.inline_datum;
        } else if (inWithDatum?.inline_datum) {
          rawDatum = inWithDatum.inline_datum;
        }

        let lotPassport: Record<string, unknown> = {};
        if (rawDatum) {
          try {
            lotPassport = (await deserializeDatum(rawDatum)) as Record<string, unknown>;
          } catch (err) {
            console.error(`Passport decode failed for record ${tx_hash}:`, err);
          }
        }

        histories.push({
          confirmationRef: tx_hash,
          recordedAt: txInfo.block_time,
          recordKeepingCharge: txInfo.fees,
          outcome: 'Completed',
          milestone,
          lotPassport,
        });
      } catch (err) {
        console.error(`Error processing record ${tx_hash}:`, err);
      }
    }

    histories.sort((a, b) => b.recordedAt - a.recordedAt);

    const filteredLog: HandlingLogEntry[] = [];
    for (const entry of histories) {
      filteredLog.push(entry);
      if (entry.milestone === 'Lot first registered') {
        break;
      }
    }

    if (
      filteredLog.length === 0 ||
      !filteredLog.some((e) => e.milestone === 'Lot first registered')
    ) {
      return {
        lotPassport: (histories[0]?.lotPassport as Record<string, unknown>) || {},
        handlingLog: histories,
        tracingEnded: false,
        message: 'No first registration event found for this inventory key.',
      };
    }

    const latestPassport = (histories[0]?.lotPassport as Record<string, unknown>) || {};

    return {
      lotPassport: latestPassport,
      handlingLog: filteredLog,
      tracingEnded:
        histories.length > 0 && histories[0].milestone === 'Lot closed in circulation',
    };
  }

  async getProductTrace(inventoryKey: string): Promise<TraceResult> {
    const base = await this.getProductTraceInternal(inventoryKey);
    const row = await (this.prisma as any).container.findUnique({
      where: { inventoryKey },
      select: { status: true },
    });
    return {
      ...base,
      lifecycleStatus: row?.status ?? null,
    };
  }
}
