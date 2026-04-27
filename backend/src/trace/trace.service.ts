import { Injectable } from '@nestjs/common';
import { BlockFrostAPI, BlockfrostServerError } from '@blockfrost/blockfrost-js';
import * as cbor from 'cbor';
import { deserializeDatum } from '../utils/deserialize-datum';

const POLICY_ID_HEX_LEN = 56;
const CIP68_100_PREFIX = '000643b0';
const CIP68_222_PREFIX = '000de140';

function buildNativeAssetUnitCandidates(inventoryKey: string): string[] {
  const raw = (inventoryKey || '').trim();
  if (!raw) {
    return [];
  }
  const k = raw.toLowerCase().replace(/^0x/, '');
  const candidates: string[] = [];
  const push = (u: string) => {
    const t = u.trim().toLowerCase();
    if (t && !candidates.includes(t)) {
      candidates.push(t);
    }
  };
  push(k);
  if (!/^[0-9a-f]+$/.test(k)) {
    const hexFromUtf8 = Buffer.from(raw, 'utf8').toString('hex').toLowerCase();
    if (hexFromUtf8) {
      push(hexFromUtf8);
    }
  }
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
    return err.status_code === 404 || err.status_code === 400;
  }
  return false;
}

export interface TraceResult {
  lotPassport: Record<string, unknown>;
  transactions?: Array<{ txHash: string; blockTime: number | null }>;
  latestSignerWallet?: string | null;
  message?: string;
}

@Injectable()
export class TraceService {
  private blockfrost: BlockFrostAPI;

  private parseParticipantWallets(raw: unknown): string[] {
    if (Array.isArray(raw)) {
      return raw.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean);
    }
    const text = String(raw || '').trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean);
      }
    } catch {}
    return (text.match(/addr_[a-z0-9]+/gi) || [])
      .map((x) => String(x || '').trim().toLowerCase())
      .filter(Boolean);
  }

  private extractLatestSignerWallet(utxos: any, participantWallets: string[]): string | null {
    const inputAddresses = Array.isArray(utxos?.inputs)
      ? utxos.inputs
          .map((x: any) => String(x?.address || '').trim().toLowerCase())
          .filter(Boolean)
      : [];
    if (!inputAddresses.length) return null;
    if (participantWallets.length) {
      const matched = inputAddresses.find((addr) => participantWallets.includes(addr));
      if (matched) return matched;
    }
    return inputAddresses[0] || null;
  }

  private extractProductionInventoryKeyHex(rawDatum: string): string {
    try {
      const cborDatum = Buffer.from(rawDatum, 'hex');
      const decoded = cbor.decodeFirstSync(cborDatum) as { value?: unknown[] } | unknown[];
      const datumMap = Array.isArray(decoded) ? decoded[0] : decoded?.value?.[0];
      if (!(datumMap instanceof Map)) {
        return '';
      }
      for (const [k, v] of datumMap.entries()) {
        const key =
          Buffer.isBuffer(k) || k instanceof Uint8Array
            ? Buffer.from(k).toString('utf-8')
            : String(k);
        if (key !== 'production_inventory_key') continue;
        if (Buffer.isBuffer(v) || v instanceof Uint8Array) {
          return `0x${Buffer.from(v).toString('hex')}`;
        }
        const text = String(v ?? '').trim();
        if (!text) return '';
        return text.startsWith('0x') ? text : text;
      }
      return '';
    } catch {
      return '';
    }
  }

  constructor() {
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

  private async resolveBlockfrostAssetUnit(
    inventoryKey: string,
  ): Promise<{ unit: string } | { error: TraceResult }> {
    const candidates = buildNativeAssetUnitCandidates(inventoryKey);
    if (candidates.length === 0) {
      return {
        error: {
          lotPassport: {},
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
        message:
          lastErr instanceof Error
            ? `Blockfrost could not find this asset (tried CIP-68 unit variants). ${lastErr.message}`
            : 'Blockfrost could not find this asset for the given inventory key.',
      },
    };
  }

  private async readLatestPassport(inventoryKey: string): Promise<TraceResult> {
    const resolved = await this.resolveBlockfrostAssetUnit(inventoryKey);
    if ('error' in resolved) {
      return resolved.error;
    }
    const chainUnit = resolved.unit;

    const assetTxRefs = await this.blockfrost.assetsTransactions(chainUnit, { count: 100, page: 1, order: 'desc' as any });
    const transactions = await Promise.all(
      (assetTxRefs || []).map(async (tx: any) => {
        const txHash = String(tx?.tx_hash || '').trim();
        if (!txHash) return null;
        try {
          const txInfo = await this.blockfrost.txs(txHash);
          return {
            txHash,
            blockTime: typeof txInfo?.block_time === 'number' ? txInfo.block_time : null,
          };
        } catch {
          return { txHash, blockTime: null };
        }
      }),
    );
    const txList = transactions.filter(Boolean) as Array<{ txHash: string; blockTime: number | null }>;

    const latestTxHash = String(assetTxRefs?.[0]?.tx_hash || '').trim();
    if (!latestTxHash) {
      return {
        lotPassport: {},
        transactions: txList,
        latestSignerWallet: null,
        message: 'No transaction found for this inventory key.',
      };
    }
    try {
      const utxos = await this.blockfrost.txsUtxos(latestTxHash);
      const outputWithAsset = utxos.outputs.find((output: { amount: { unit: string; quantity: string }[] }) =>
        output.amount.some((a) => a.unit === chainUnit),
      );
      const rawDatum = String((outputWithAsset as { inline_datum?: string } | undefined)?.inline_datum || '').trim();
      if (!rawDatum) {
        return {
          lotPassport: {},
          transactions: txList,
          message: 'Latest transaction has no inline datum on output.',
        };
      }
      const lotPassport = (await deserializeDatum(rawDatum)) as Record<string, unknown>;
      const productionInventoryKeyHex = this.extractProductionInventoryKeyHex(rawDatum);
      if (productionInventoryKeyHex) {
        lotPassport.production_inventory_key = productionInventoryKeyHex;
      }
      const participantWallets = this.parseParticipantWallets(
        lotPassport?.participant_wallet_addresses,
      );
      const latestSignerWallet = this.extractLatestSignerWallet(utxos, participantWallets);
      return { lotPassport, transactions: txList, latestSignerWallet };
    } catch (err) {
      console.error(`Error processing latest record ${latestTxHash}:`, err);
      return {
        lotPassport: {},
        transactions: txList,
        latestSignerWallet: null,
        message: 'Failed to decode latest on-chain passport.',
      };
    }
  }

  async getProductTrace(inventoryKey: string): Promise<TraceResult> {
    return this.readLatestPassport(inventoryKey);
  }
}
