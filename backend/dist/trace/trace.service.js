"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceService = void 0;
const common_1 = require("@nestjs/common");
const blockfrost_js_1 = require("@blockfrost/blockfrost-js");
const cbor = __importStar(require("cbor"));
const deserialize_datum_1 = require("../utils/deserialize-datum");
const prisma_service_1 = require("../prisma/prisma.service");
const POLICY_ID_HEX_LEN = 56;
const CIP68_100_PREFIX = '000643b0';
const CIP68_222_PREFIX = '000de140';
const HEX_RE = /^[0-9a-f]+$/i;
function buildNativeAssetUnitCandidates(inventoryKey) {
    const raw = (inventoryKey || '').trim();
    if (!raw) {
        return [];
    }
    const k = raw.toLowerCase().replace(/^0x/, '');
    const candidates = [];
    const push = (u) => {
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
        if (rest.length > 0 &&
            rest.length % 2 === 0 &&
            !rest.startsWith(CIP68_100_PREFIX) &&
            !rest.startsWith(CIP68_222_PREFIX)) {
            push(`${policy}${CIP68_100_PREFIX}${rest}`);
            push(`${policy}${CIP68_222_PREFIX}${rest}`);
        }
    }
    return candidates;
}
function isAssetNotFoundError(err) {
    if (err instanceof blockfrost_js_1.BlockfrostServerError) {
        return err.status_code === 404 || err.status_code === 400;
    }
    return false;
}
let TraceService = class TraceService {
    parseParticipantWallets(raw) {
        if (Array.isArray(raw)) {
            return raw.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean);
        }
        const text = String(raw || '').trim();
        if (!text)
            return [];
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
                return parsed.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean);
            }
        }
        catch { }
        return (text.match(/addr_[a-z0-9]+/gi) || [])
            .map((x) => String(x || '').trim().toLowerCase())
            .filter(Boolean);
    }
    parseParticipantLocations(raw) {
        const text = String(raw || '').trim();
        if (!text)
            return [];
        return text
            .split(';')
            .map((x) => String(x || '').trim())
            .filter(Boolean);
    }
    extractLatestSignerWallet(utxos, participantWallets) {
        const inputAddresses = Array.isArray(utxos?.inputs)
            ? utxos.inputs
                .map((x) => String(x?.address || '').trim().toLowerCase())
                .filter(Boolean)
            : [];
        if (!inputAddresses.length)
            return null;
        if (participantWallets.length) {
            const matched = inputAddresses.find((addr) => participantWallets.includes(addr));
            if (matched)
                return matched;
        }
        return inputAddresses[0] || null;
    }
    extractProductionInventoryKeyHex(rawDatum) {
        try {
            const cborDatum = Buffer.from(rawDatum, 'hex');
            const decoded = cbor.decodeFirstSync(cborDatum);
            const datumMap = Array.isArray(decoded) ? decoded[0] : decoded?.value?.[0];
            if (!(datumMap instanceof Map)) {
                return '';
            }
            for (const [k, v] of datumMap.entries()) {
                const key = Buffer.isBuffer(k) || k instanceof Uint8Array
                    ? Buffer.from(k).toString('utf-8')
                    : String(k);
                if (key !== 'production_inventory_key')
                    continue;
                if (Buffer.isBuffer(v) || v instanceof Uint8Array) {
                    return `0x${Buffer.from(v).toString('hex')}`;
                }
                const text = String(v ?? '').trim();
                if (!text)
                    return '';
                return text.startsWith('0x') ? text : text;
            }
            return '';
        }
        catch {
            return '';
        }
    }
    parseProductionRefInline(value) {
        const raw = String(value || '').trim();
        if (!raw)
            return null;
        const dot = raw.indexOf('.');
        if (dot <= 0)
            return null;
        const policyId = raw.slice(0, dot).trim().toLowerCase();
        const assetName = raw.slice(dot + 1).trim();
        if (!policyId || !assetName || policyId.length !== POLICY_ID_HEX_LEN || !HEX_RE.test(policyId))
            return null;
        return { policyId, assetName };
    }
    encodeRefUnit(policyId, assetName) {
        const policy = String(policyId || '').trim().toLowerCase();
        const name = String(assetName || '').trim();
        if (!policy || !name || policy.length !== POLICY_ID_HEX_LEN || !HEX_RE.test(policy))
            return '';
        const assetHex = Buffer.from(name, 'utf8').toString('hex').toLowerCase();
        return `${policy}${CIP68_100_PREFIX}${assetHex}`;
    }
    async readLatestMetadataByUnit(unit) {
        const refs = await this.blockfrost.assetsTransactions(unit, { count: 1, page: 1, order: 'desc' });
        const latestTxHash = String(refs?.[0]?.tx_hash || '').trim();
        if (!latestTxHash)
            return null;
        const utxos = await this.blockfrost.txsUtxos(latestTxHash);
        const outputs = Array.isArray(utxos?.outputs) ? utxos.outputs : [];
        const outputWithDatum = outputs.find((o) => {
            const datum = String(o?.inline_datum || '').trim();
            const amounts = Array.isArray(o?.amount) ? o.amount : [];
            if (!datum)
                return false;
            for (let i = 0; i < amounts.length; i += 1) {
                if (String(amounts[i]?.unit || '').trim().toLowerCase() === String(unit).toLowerCase())
                    return true;
            }
            return false;
        });
        const rawDatum = String(outputWithDatum?.inline_datum || '').trim();
        if (!rawDatum)
            return null;
        return (await (0, deserialize_datum_1.deserializeDatum)(rawDatum));
    }
    async listAssetTxHashes(unit) {
        const hashes = [];
        let page = 1;
        while (true) {
            const refs = await this.blockfrost.assetsTransactions(unit, { count: 100, page, order: 'desc' });
            if (!Array.isArray(refs) || refs.length === 0)
                break;
            for (let i = 0; i < refs.length; i += 1) {
                const txHash = String(refs[i]?.tx_hash || '').trim();
                if (txHash)
                    hashes.push(txHash);
            }
            if (refs.length < 100)
                break;
            page += 1;
        }
        return hashes;
    }
    async readMetadataByTxHashAndUnit(txHash, unit) {
        const utxos = await this.blockfrost.txsUtxos(txHash);
        const outputs = Array.isArray(utxos?.outputs) ? utxos.outputs : [];
        const outputWithDatum = outputs.find((o) => {
            const datum = String(o?.inline_datum || '').trim();
            const amounts = Array.isArray(o?.amount) ? o.amount : [];
            if (!datum)
                return false;
            for (let i = 0; i < amounts.length; i += 1) {
                if (String(amounts[i]?.unit || '').trim().toLowerCase() === String(unit).toLowerCase())
                    return true;
            }
            return false;
        });
        const rawDatum = String(outputWithDatum?.inline_datum || '').trim();
        if (!rawDatum)
            return null;
        return (await (0, deserialize_datum_1.deserializeDatum)(rawDatum));
    }
    async buildHistory(containerUnit, productionUnit) {
        const productionHashes = productionUnit ? await this.listAssetTxHashes(productionUnit) : [];
        const containerHashes = containerUnit ? await this.listAssetTxHashes(containerUnit) : [];
        const merged = [];
        for (let i = 0; i < productionHashes.length; i += 1) {
            merged.push({ source: 'PRODUCTION', txHash: productionHashes[i] });
        }
        for (let i = 0; i < containerHashes.length; i += 1) {
            merged.push({ source: 'CONTAINER', txHash: containerHashes[i] });
        }
        const uniqByHash = new Map();
        for (let i = 0; i < merged.length; i += 1) {
            const row = merged[i];
            if (!uniqByHash.has(row.txHash))
                uniqByHash.set(row.txHash, row);
        }
        const uniqueRows = Array.from(uniqByHash.values());
        const out = [];
        for (let i = 0; i < uniqueRows.length; i += 1) {
            const row = uniqueRows[i];
            const unit = row.source === 'PRODUCTION' ? productionUnit : containerUnit;
            try {
                const tx = await this.blockfrost.txs(row.txHash);
                const blockTime = Number(tx?.block_time || 0);
                const time = blockTime > 0 ? new Date(blockTime * 1000).toISOString() : '';
                const metadata = await this.readMetadataByTxHashAndUnit(row.txHash, unit);
                out.push({ source: row.source, txHash: row.txHash, time, metadata });
            }
            catch {
                out.push({ source: row.source, txHash: row.txHash, time: '', metadata: null });
            }
        }
        out.sort((a, b) => {
            const at = new Date(String(a.time || '')).getTime();
            const bt = new Date(String(b.time || '')).getTime();
            return (Number.isFinite(bt) ? bt : 0) - (Number.isFinite(at) ? at : 0);
        });
        return out;
    }
    async resolveHistoryUnits(inventoryKey) {
        const resolved = await this.resolveBlockfrostAssetUnit(inventoryKey);
        if ('error' in resolved)
            return { containerUnit: '', productionUnit: '' };
        const containerUnit = resolved.unit;
        let productionUnit = '';
        try {
            const refs = await this.blockfrost.assetsTransactions(containerUnit, { count: 1, page: 1, order: 'desc' });
            const latestTxHash = String(refs?.[0]?.tx_hash || '').trim();
            if (!latestTxHash)
                return { containerUnit, productionUnit };
            const utxos = await this.blockfrost.txsUtxos(latestTxHash);
            const outputWithAsset = utxos.outputs.find((output) => output.amount.some((a) => a.unit === containerUnit));
            const rawDatum = String(outputWithAsset?.inline_datum || '').trim();
            if (!rawDatum)
                return { containerUnit, productionUnit };
            const lotPassport = (await (0, deserialize_datum_1.deserializeDatum)(rawDatum));
            const productionRef = this.parseProductionRefInline(lotPassport?.production_ref_inline);
            if (!productionRef)
                return { containerUnit, productionUnit };
            productionUnit = this.encodeRefUnit(productionRef.policyId, productionRef.assetName);
            return { containerUnit, productionUnit };
        }
        catch {
            return { containerUnit, productionUnit };
        }
    }
    constructor(prisma) {
        this.prisma = prisma;
        const projectId = process.env.BLOCKFROST_API_KEY || '';
        if (!projectId) {
            throw new Error('Chưa cấu hình BLOCKFROST_API_KEY trên server.');
        }
        const network = (process.env.APP_NETWORK || process.env.BLOCKFROST_NETWORK || 'preprod')
            .toLowerCase() === 'mainnet'
            ? 'mainnet'
            : 'preprod';
        this.blockfrost = new blockfrost_js_1.BlockFrostAPI({
            projectId,
            network,
        });
    }
    async buildPointDetails(lotPassport) {
        const wallets = this.parseParticipantWallets(lotPassport?.verified_wallet_addresses || lotPassport?.participant_wallet_addresses);
        const locations = this.parseParticipantLocations(lotPassport?.participant_location_labels);
        const uniqueWallets = Array.from(new Set(wallets));
        const users = uniqueWallets.length
            ? await this.prisma.user.findMany({
                where: { address: { in: uniqueWallets } },
                select: { address: true, displayName: true },
            })
            : [];
        const userNameByAddress = new Map();
        for (let i = 0; i < users.length; i += 1) {
            const row = users[i];
            const address = String(row?.address || '').trim().toLowerCase();
            const name = String(row?.displayName || '').trim();
            if (address)
                userNameByAddress.set(address, name);
        }
        const points = [];
        for (let i = 0; i < wallets.length; i += 1) {
            const walletAddress = String(wallets[i] || '').trim().toLowerCase();
            if (!walletAddress)
                continue;
            const location = String(locations[i] || '').trim();
            const name = userNameByAddress.get(walletAddress) || '';
            points.push({ name, walletAddress, location });
        }
        return points;
    }
    async resolveBlockfrostAssetUnit(inventoryKey) {
        const candidates = buildNativeAssetUnitCandidates(inventoryKey);
        if (candidates.length === 0) {
            return {
                error: {
                    lotPassport: {},
                    message: 'Mã inventory không hợp lệ để tra cứu on-chain.',
                },
            };
        }
        let lastErr;
        for (const unit of candidates) {
            try {
                await this.blockfrost.assetsTransactions(unit, { count: 1, page: 1 });
                return { unit };
            }
            catch (e) {
                lastErr = e;
                if (!isAssetNotFoundError(e)) {
                    throw e;
                }
            }
        }
        return {
            error: {
                lotPassport: {},
                message: lastErr instanceof Error
                    ? `Blockfrost không tìm thấy asset (đã thử biến thể CIP-68). ${lastErr.message}`
                    : 'Blockfrost không tìm thấy asset cho mã inventory này.',
            },
        };
    }
    async readLatestPassport(inventoryKey) {
        const resolved = await this.resolveBlockfrostAssetUnit(inventoryKey);
        if ('error' in resolved) {
            return resolved.error;
        }
        const chainUnit = resolved.unit;
        const assetTxRefs = await this.blockfrost.assetsTransactions(chainUnit, { count: 1, page: 1, order: 'desc' });
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
            const outputWithAsset = utxos.outputs.find((output) => output.amount.some((a) => a.unit === chainUnit));
            const rawDatum = String(outputWithAsset?.inline_datum || '').trim();
            if (!rawDatum) {
                return {
                    lotPassport: {},
                    message: 'Giao dịch mới nhất không có inline datum trên output.',
                };
            }
            const lotPassport = (await (0, deserialize_datum_1.deserializeDatum)(rawDatum));
            const productionInventoryKeyHex = this.extractProductionInventoryKeyHex(rawDatum);
            if (productionInventoryKeyHex) {
                lotPassport.production_inventory_key = productionInventoryKeyHex;
            }
            const participantWallets = this.parseParticipantWallets(lotPassport?.participant_wallet_addresses);
            const latestSignerWallet = this.extractLatestSignerWallet(utxos, participantWallets);
            const points = await this.buildPointDetails(lotPassport);
            let productionMetadata = null;
            let productionUnit = '';
            const productionRef = this.parseProductionRefInline(lotPassport?.production_ref_inline);
            if (productionRef) {
                productionUnit = this.encodeRefUnit(productionRef.policyId, productionRef.assetName);
                if (productionUnit) {
                    try {
                        productionMetadata = await this.readLatestMetadataByUnit(productionUnit);
                    }
                    catch {
                        productionMetadata = null;
                    }
                }
            }
            return { lotPassport, productionMetadata, points, latestSignerWallet };
        }
        catch (err) {
            console.error(`Error processing latest record ${latestTxHash}:`, err);
            return {
                lotPassport: {},
                latestSignerWallet: null,
                message: 'Không giải mã được passport on-chain mới nhất.',
            };
        }
    }
    async getProductTrace(inventoryKey) {
        return this.readLatestPassport(inventoryKey);
    }
    async getTraceHistory(inventoryKey, pageRaw, limitRaw) {
        const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
        const limitUnsafe = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 10;
        const limit = limitUnsafe > 10 ? 10 : limitUnsafe;
        const units = await this.resolveHistoryUnits(inventoryKey);
        if (!units.containerUnit)
            return { items: [], total: 0, page, limit };
        const full = (await this.buildHistory(units.containerUnit, units.productionUnit)) || [];
        const total = full.length;
        const start = (page - 1) * limit;
        const items = full.slice(start, start + limit);
        return { items, total, page, limit };
    }
};
exports.TraceService = TraceService;
exports.TraceService = TraceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TraceService);
//# sourceMappingURL=trace.service.js.map