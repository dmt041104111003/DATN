import { Injectable } from '@nestjs/common';
import { BlockFrostAPI, BlockfrostServerError } from '@blockfrost/blockfrost-js';
import * as cbor from 'cbor';
import { deserializeDatum } from '../utils/deserialize-datum';
import { PrismaService } from '../prisma/prisma.service';
import {
  displayLocationText,
  resolveLocationLabelText,
  roleLabelVi,
  storageOpLabelVi,
} from './location-label.resolver';

const POLICY_ID_HEX_LEN = 56;
const CIP68_100_PREFIX = '000643b0';
const CIP68_222_PREFIX = '000de140';
const HEX_RE = /^[0-9a-f]+$/i;

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

export type TraceLatestAction = {
  signerWallet: string;
  signerName: string;
  signerRole: string;
  signerRoleText: string;
  signerLocationLabel: string;
  signerLocationText: string;
  storageOp: string;
  storageOpText: string;
  signedAt: string;
};

export type TraceHistorySummary = {
  title: string;
  signerName: string;
  signerRoleText: string;
  signerLocationText: string;
  storageOpText: string;
  statusText: string;
};

export interface TraceResult {
  lotPassport: Record<string, unknown>;
  productionMetadata?: Record<string, unknown> | null;
  points?: Array<{ name: string; walletAddress: string; location: string; locationText: string; roleText: string }>;
  latestSignerWallet?: string | null;
  latestAction?: TraceLatestAction | null;
  message?: string;
}

type TraceHistoryItem = {
  source: 'PRODUCTION' | 'CONTAINER';
  txHash: string;
  time: string;
  metadata: Record<string, unknown> | null;
  summary: TraceHistorySummary | null;
};

export interface TraceHistoryResult {
  items: TraceHistoryItem[];
  total: number;
  page: number;
  limit: number;
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

  private parseParticipantLocations(raw: unknown): string[] {
    const text = String(raw || '').trim();
    if (!text) return [];
    return text
      .split(';')
      .map((x) => String(x || '').trim())
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

  private parseProductionRefInline(value: unknown): { policyId: string; assetName: string } | null {
    const raw = String(value || '').trim();
    if (!raw) return null;
    const dot = raw.indexOf('.');
    if (dot <= 0) return null;
    const policyId = raw.slice(0, dot).trim().toLowerCase();
    const assetName = raw.slice(dot + 1).trim();
    if (!policyId || !assetName || policyId.length !== POLICY_ID_HEX_LEN || !HEX_RE.test(policyId)) return null;
    return { policyId, assetName };
  }

  private encodeRefUnit(policyId: string, assetName: string): string {
    const policy = String(policyId || '').trim().toLowerCase();
    const name = String(assetName || '').trim();
    if (!policy || !name || policy.length !== POLICY_ID_HEX_LEN || !HEX_RE.test(policy)) return '';
    const assetHex = Buffer.from(name, 'utf8').toString('hex').toLowerCase();
    return `${policy}${CIP68_100_PREFIX}${assetHex}`;
  }

  private async readLatestMetadataByUnit(unit: string): Promise<Record<string, unknown> | null> {
    const refs = await this.blockfrost.assetsTransactions(unit, { count: 1, page: 1, order: 'desc' as any });
    const latestTxHash = String(refs?.[0]?.tx_hash || '').trim();
    if (!latestTxHash) return null;
    const utxos = await this.blockfrost.txsUtxos(latestTxHash);
    const outputs = Array.isArray(utxos?.outputs) ? utxos.outputs : [];
    const outputWithDatum = outputs.find((o: any) => {
      const datum = String(o?.inline_datum || '').trim();
      const amounts = Array.isArray(o?.amount) ? o.amount : [];
      if (!datum) return false;
      for (let i = 0; i < amounts.length; i += 1) {
        if (String(amounts[i]?.unit || '').trim().toLowerCase() === String(unit).toLowerCase()) return true;
      }
      return false;
    });
    const rawDatum = String(outputWithDatum?.inline_datum || '').trim();
    if (!rawDatum) return null;
    return (await deserializeDatum(rawDatum)) as Record<string, unknown>;
  }

  private async listAssetTxHashes(unit: string): Promise<string[]> {
    const hashes: string[] = [];
    let page = 1;
    while (true) {
      const refs = await this.blockfrost.assetsTransactions(unit, { count: 100, page, order: 'desc' as any });
      if (!Array.isArray(refs) || refs.length === 0) break;
      for (let i = 0; i < refs.length; i += 1) {
        const txHash = String(refs[i]?.tx_hash || '').trim();
        if (txHash) hashes.push(txHash);
      }
      if (refs.length < 100) break;
      page += 1;
    }
    return hashes;
  }

  private async readMetadataByTxHashAndUnit(txHash: string, unit: string): Promise<Record<string, unknown> | null> {
    const utxos = await this.blockfrost.txsUtxos(txHash);
    const outputs = Array.isArray(utxos?.outputs) ? utxos.outputs : [];
    const outputWithDatum = outputs.find((o: any) => {
      const datum = String(o?.inline_datum || '').trim();
      const amounts = Array.isArray(o?.amount) ? o.amount : [];
      if (!datum) return false;
      for (let i = 0; i < amounts.length; i += 1) {
        if (String(amounts[i]?.unit || '').trim().toLowerCase() === String(unit).toLowerCase()) return true;
      }
      return false;
    });
    const rawDatum = String(outputWithDatum?.inline_datum || '').trim();
    if (!rawDatum) return null;
    return (await deserializeDatum(rawDatum)) as Record<string, unknown>;
  }

  private async buildHistory(containerUnit: string, productionUnit: string): Promise<TraceHistoryItem[]> {
    const productionHashes = productionUnit ? await this.listAssetTxHashes(productionUnit) : [];
    const containerHashes = containerUnit ? await this.listAssetTxHashes(containerUnit) : [];
    const merged: Array<{ source: 'PRODUCTION' | 'CONTAINER'; txHash: string }> = [];
    for (let i = 0; i < productionHashes.length; i += 1) {
      merged.push({ source: 'PRODUCTION', txHash: productionHashes[i] });
    }
    for (let i = 0; i < containerHashes.length; i += 1) {
      merged.push({ source: 'CONTAINER', txHash: containerHashes[i] });
    }
    const uniqByHash = new Map<string, { source: 'PRODUCTION' | 'CONTAINER'; txHash: string }>();
    for (let i = 0; i < merged.length; i += 1) {
      const row = merged[i];
      if (!uniqByHash.has(row.txHash)) uniqByHash.set(row.txHash, row);
    }
    const uniqueRows = Array.from(uniqByHash.values());
    const out: TraceHistoryItem[] = [];
    for (let i = 0; i < uniqueRows.length; i += 1) {
      const row = uniqueRows[i];
      const unit = row.source === 'PRODUCTION' ? productionUnit : containerUnit;
      try {
        const tx = await this.blockfrost.txs(row.txHash as any);
        const blockTime = Number((tx as any)?.block_time || 0);
        const time = blockTime > 0 ? new Date(blockTime * 1000).toISOString() : '';
        const metadata = await this.readMetadataByTxHashAndUnit(row.txHash, unit);
        const summary = await this.buildHistorySummary(row.source, metadata);
        out.push({ source: row.source, txHash: row.txHash, time, metadata, summary });
      } catch {
        out.push({ source: row.source, txHash: row.txHash, time: '', metadata: null, summary: null });
      }
    }
    out.sort((a, b) => {
      const at = new Date(String(a.time || '')).getTime();
      const bt = new Date(String(b.time || '')).getTime();
      return (Number.isFinite(bt) ? bt : 0) - (Number.isFinite(at) ? at : 0);
    });
    return out;
  }

  private async resolveHistoryUnits(inventoryKey: string): Promise<{ containerUnit: string; productionUnit: string }> {
    const resolved = await this.resolveBlockfrostAssetUnit(inventoryKey);
    if ('error' in resolved) return { containerUnit: '', productionUnit: '' };
    const containerUnit = resolved.unit;
    let productionUnit = '';
    try {
      const refs = await this.blockfrost.assetsTransactions(containerUnit, { count: 1, page: 1, order: 'desc' as any });
      const latestTxHash = String(refs?.[0]?.tx_hash || '').trim();
      if (!latestTxHash) return { containerUnit, productionUnit };
      const utxos = await this.blockfrost.txsUtxos(latestTxHash);
      const outputWithAsset = utxos.outputs.find((output: { amount: { unit: string; quantity: string }[] }) =>
        output.amount.some((a) => a.unit === containerUnit),
      );
      const rawDatum = String((outputWithAsset as { inline_datum?: string } | undefined)?.inline_datum || '').trim();
      if (!rawDatum) return { containerUnit, productionUnit };
      const lotPassport = (await deserializeDatum(rawDatum)) as Record<string, unknown>;
      const productionRef = this.parseProductionRefInline(lotPassport?.production_ref_inline);
      if (!productionRef) return { containerUnit, productionUnit };
      productionUnit = this.encodeRefUnit(productionRef.policyId, productionRef.assetName);
      return { containerUnit, productionUnit };
    } catch {
      return { containerUnit, productionUnit };
    }
  }

  constructor(private readonly prisma: PrismaService) {
    const projectId = process.env.BLOCKFROST_API_KEY || '';
    if (!projectId) {
      throw new Error('Chưa cấu hình BLOCKFROST_API_KEY trên server.');
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

  private async lookupSignerName(walletRaw: unknown): Promise<string> {
    const wallet = String(walletRaw || '').trim().toLowerCase();
    if (!wallet) return '';
    const user = await (this.prisma as any).user.findUnique({
      where: { address: wallet },
      select: { displayName: true },
    });
    return String((user as any)?.displayName || '').trim();
  }

  private async buildLatestAction(
    lotPassport: Record<string, unknown>,
    latestSignerWallet: string | null,
  ): Promise<TraceLatestAction | null> {
    const signerWallet = String(
      lotPassport?.signer_wallet || latestSignerWallet || '',
    )
      .trim()
      .toLowerCase();
    const signerLocationLabel = String(lotPassport?.signer_location_label || '').trim();
    const signerRole = String(lotPassport?.signer_role || '').trim();
    const storageOp = String(lotPassport?.storage_op || '').trim();
    const signedAt = String(
      lotPassport?.storage_updated_at || lotPassport?.updated_at || lotPassport?.storage_created_at || '',
    ).trim();
    if (!signerWallet && !signerLocationLabel && !signerRole && !storageOp) return null;

    const signerName = (await this.lookupSignerName(signerWallet)) || signerWallet;
    const signerLocationResolved = signerLocationLabel
      ? await resolveLocationLabelText(signerLocationLabel)
      : '';
    return {
      signerWallet,
      signerName,
      signerRole,
      signerRoleText: roleLabelVi(signerRole),
      signerLocationLabel,
      signerLocationText: displayLocationText(signerLocationLabel, signerLocationResolved),
      storageOp,
      storageOpText: storageOpLabelVi(storageOp),
      signedAt,
    };
  }

  private async buildHistorySummary(
    source: 'PRODUCTION' | 'CONTAINER',
    metadata: Record<string, unknown> | null,
  ): Promise<TraceHistorySummary | null> {
    if (!metadata) return null;
    const signerWallet = String(metadata.signer_wallet || '').trim().toLowerCase();
    const signerRole = String(metadata.signer_role || '').trim();
    const signerLocationLabel = String(metadata.signer_location_label || '').trim();
    const storageOp = String(metadata.storage_op || '').trim();
    const status = String(metadata.status || '').trim();
    const signerName = (await this.lookupSignerName(signerWallet)) || signerWallet || 'Chưa rõ';
    const locationRaw = signerLocationLabel || String(metadata.location || '').trim();
    const signerLocationResolved = locationRaw ? await resolveLocationLabelText(locationRaw) : '';
    const signerLocationText = displayLocationText(locationRaw, signerLocationResolved);
    const title = source === 'PRODUCTION' ? 'Vụ mùa' : storageOp ? 'Kho lưu trữ' : 'Thùng hàng';
    return {
      title,
      signerName,
      signerRoleText: roleLabelVi(signerRole),
      signerLocationText,
      storageOpText: storageOpLabelVi(storageOp),
      statusText: status || '-',
    };
  }

  private async buildPointDetails(lotPassport: Record<string, unknown>) {
    const wallets = this.parseParticipantWallets(
      lotPassport?.verified_wallet_addresses || lotPassport?.participant_wallet_addresses,
    );
    const locations = this.parseParticipantLocations(lotPassport?.participant_location_labels);
    const uniqueWallets = Array.from(new Set(wallets));
    const users = uniqueWallets.length
      ? await (this.prisma as any).user.findMany({
          where: { address: { in: uniqueWallets } },
          select: { address: true, displayName: true },
        })
      : [];
    const userNameByAddress = new Map<string, string>();
    for (let i = 0; i < users.length; i += 1) {
      const row = users[i] as any;
      const address = String(row?.address || '').trim().toLowerCase();
      const name = String(row?.displayName || '').trim();
      if (address) userNameByAddress.set(address, name);
    }
    const points: Array<{
      name: string;
      walletAddress: string;
      location: string;
      locationText: string;
      roleText: string;
    }> = [];
    const roleByIndex = ['Doanh nghiệp sản xuất', 'Kho trung chuyển', 'Đại lý phân phối'];
    for (let i = 0; i < wallets.length; i += 1) {
      const walletAddress = String(wallets[i] || '').trim().toLowerCase();
      if (!walletAddress) continue;
      const location = String(locations[i] || '').trim();
      const locationResolved = location ? await resolveLocationLabelText(location) : '';
      const locationText = displayLocationText(location, locationResolved);
      const name = userNameByAddress.get(walletAddress) || '';
      points.push({
        name,
        walletAddress,
        location: locationText,
        locationText,
        roleText: roleByIndex[i] || 'Đơn vị tham gia',
      });
    }
    return points;
  }

  private async resolveBlockfrostAssetUnit(
    inventoryKey: string,
  ): Promise<{ unit: string } | { error: TraceResult }> {
    const candidates = buildNativeAssetUnitCandidates(inventoryKey);
    if (candidates.length === 0) {
      return {
        error: {
          lotPassport: {},
          message: 'Mã inventory không hợp lệ để tra cứu on-chain.',
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
            ? `Blockfrost không tìm thấy asset (đã thử biến thể CIP-68). ${lastErr.message}`
            : 'Blockfrost không tìm thấy asset cho mã inventory này.',
      },
    };
  }

  private async readLatestPassport(inventoryKey: string): Promise<TraceResult> {
    const resolved = await this.resolveBlockfrostAssetUnit(inventoryKey);
    if ('error' in resolved) {
      return resolved.error;
    }
    const chainUnit = resolved.unit;

    const assetTxRefs = await this.blockfrost.assetsTransactions(chainUnit, { count: 1, page: 1, order: 'desc' as any });
    const latestTxHash = String(assetTxRefs?.[0]?.tx_hash || '').trim();
    if (!latestTxHash) {
      return {
        lotPassport: {},
        latestSignerWallet: null,
        message: 'Không tìm thấy giao dịch cho mã inventory này.',
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
          message: 'Giao dịch mới nhất không có inline datum trên output.',
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
      const points = await this.buildPointDetails(lotPassport);
      let productionMetadata: Record<string, unknown> | null = null;
      let productionUnit = '';
      const productionRef = this.parseProductionRefInline(lotPassport?.production_ref_inline);
      if (productionRef) {
        productionUnit = this.encodeRefUnit(productionRef.policyId, productionRef.assetName);
        if (productionUnit) {
          try {
            productionMetadata = await this.readLatestMetadataByUnit(productionUnit);
          } catch {
            productionMetadata = null;
          }
        }
      }
      if (productionMetadata && productionMetadata.location) {
        const locationRaw = String(productionMetadata.location || '').trim();
        const locationResolved = locationRaw ? await resolveLocationLabelText(locationRaw) : '';
        productionMetadata = {
          ...productionMetadata,
          location: displayLocationText(locationRaw, locationResolved),
        };
      }
      const latestAction = await this.buildLatestAction(lotPassport, latestSignerWallet);
      return { lotPassport, productionMetadata, points, latestSignerWallet, latestAction };
    } catch (err) {
      console.error(`Error processing latest record ${latestTxHash}:`, err);
      return {
        lotPassport: {},
        latestSignerWallet: null,
        message: 'Không giải mã được passport on-chain mới nhất.',
      };
    }
  }

  async getProductTrace(inventoryKey: string): Promise<TraceResult> {
    return this.readLatestPassport(inventoryKey);
  }

  async getTraceHistory(inventoryKey: string, pageRaw: number, limitRaw: number): Promise<TraceHistoryResult> {
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
    const limitUnsafe = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 10;
    const limit = limitUnsafe > 10 ? 10 : limitUnsafe;
    const units = await this.resolveHistoryUnits(inventoryKey);
    if (!units.containerUnit) return { items: [], total: 0, page, limit };
    const full = (await this.buildHistory(units.containerUnit, units.productionUnit)) || [];
    const total = full.length;
    const start = (page - 1) * limit;
    const items = full.slice(start, start + limit);
    return { items, total, page, limit };
  }
}
