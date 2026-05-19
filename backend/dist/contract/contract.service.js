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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@meshsdk/core");
const deserialize_datum_1 = require("../utils/deserialize-datum");
const tx_builder_helper_1 = require("./helpers/tx-builder.helper");
const plutus_helper_1 = require("./helpers/plutus.helper");
let ContractService = class ContractService {
    constructor() {
        const apiKey = process.env.BLOCKFROST_API_KEY;
        if (!apiKey)
            throw new Error('Chưa cấu hình BLOCKFROST_API_KEY trên server.');
        this.blockfrostProvider = new core_1.BlockfrostProvider(apiKey);
        this.plutusHelper = new plutus_helper_1.PlutusHelper();
        this.txBuilderHelper = new tx_builder_helper_1.TxBuilderHelper(this.blockfrostProvider, this.plutusHelper, apiKey);
    }
    generateCode() {
        const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
        const time = Date.now().toString(36).slice(-8).toUpperCase();
        return `VU-${time}-${rand}`;
    }
    decodeAssetNameFromUnit(unit) {
        const u = String(unit || '').trim();
        if (!u || u.length <= 56)
            return '';
        const rest = u.slice(56);
        const label = (0, core_1.CIP68_100)('');
        const hex = rest.startsWith(label) ? rest.slice(label.length) : rest;
        if (!hex || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex))
            return '';
        try {
            const bytes = hex.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || [];
            return new TextDecoder().decode(new Uint8Array(bytes));
        }
        catch {
            return '';
        }
    }
    async loadOnchainMetadata(owners, inventoryKey) {
        const { policyId, contractAddress } = this.plutusHelper.getScripts(owners);
        const assetName = this.decodeAssetNameFromUnit(inventoryKey);
        if (!assetName)
            return null;
        const referenceUnit = policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName));
        const utxos = await this.blockfrostProvider.fetchAddressUTxOs(contractAddress, referenceUnit);
        const ref = utxos.length > 0 ? utxos[utxos.length - 1] : null;
        if (!ref)
            return null;
        const datumHex = String(ref?.output?.plutusData || '').trim() ||
            String(ref?.output?.datum || '').trim() ||
            String(ref?.output?.inlineDatum || '').trim();
        if (!datumHex)
            return null;
        return await (0, deserialize_datum_1.deserializeDatum)(datumHex.startsWith('0x') ? datumHex.slice(2) : datumHex);
    }
    blockfrostBaseUrl() {
        const network = String(process.env.APP_NETWORK || 'preprod').trim().toLowerCase();
        if (network === 'mainnet')
            return 'https://cardano-mainnet.blockfrost.io/api/v0';
        if (network === 'preview')
            return 'https://cardano-preview.blockfrost.io/api/v0';
        return 'https://cardano-preprod.blockfrost.io/api/v0';
    }
    parseOwners(raw) {
        if (Array.isArray(raw))
            return raw.map((x) => String(x || '').trim()).filter(Boolean);
        const text = String(raw || '').trim();
        if (!text)
            return [];
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed))
                return parsed.map((x) => String(x || '').trim()).filter(Boolean);
        }
        catch { }
        return [];
    }
    parseOwnersFromMetadata(metadata) {
        const fromOwners = this.parseOwners(metadata?.owners);
        if (fromOwners.length > 0)
            return fromOwners;
        return this.parseOwners(metadata?.participant_wallet_addresses);
    }
    async loadOwnersFromInventoryKey(inventoryKey) {
        const unit = String(inventoryKey || '').trim().toLowerCase();
        const apiKey = String(process.env.BLOCKFROST_API_KEY || '').trim();
        if (!unit || !apiKey)
            return [];
        const txRes = await fetch(`${this.blockfrostBaseUrl()}/assets/${encodeURIComponent(unit)}/transactions?count=1&page=1&order=desc`, { headers: { project_id: apiKey } });
        if (txRes.status !== 200)
            return [];
        const txRows = (await txRes.json().catch(() => []));
        const txHash = String(txRows?.[0]?.tx_hash || '').trim();
        if (!txHash)
            return [];
        const utxoRes = await fetch(`${this.blockfrostBaseUrl()}/txs/${encodeURIComponent(txHash)}/utxos`, { headers: { project_id: apiKey } });
        if (utxoRes.status !== 200)
            return [];
        const utxos = (await utxoRes.json().catch(() => null));
        const outputs = Array.isArray(utxos?.outputs) ? utxos.outputs : [];
        for (let i = 0; i < outputs.length; i += 1) {
            const output = outputs[i];
            const amounts = Array.isArray(output?.amount) ? output.amount : [];
            let hasUnit = false;
            for (let j = 0; j < amounts.length; j += 1) {
                if (String(amounts[j]?.unit || '').trim().toLowerCase() === unit) {
                    hasUnit = true;
                    break;
                }
            }
            if (!hasUnit)
                continue;
            const datumHex = String(output?.inline_datum || '').trim();
            if (!datumHex)
                continue;
            const metadata = (await (0, deserialize_datum_1.deserializeDatum)(datumHex.startsWith('0x') ? datumHex.slice(2) : datumHex));
            const owners = this.parseOwnersFromMetadata(metadata);
            if (owners.length > 0)
                return Array.from(new Set(owners));
        }
        return [];
    }
    stringifyMetadata(metadata) {
        const out = {};
        for (const [k, v] of Object.entries(metadata || {})) {
            out[String(k)] = String(v ?? '').trim();
        }
        return out;
    }
    async getInfo(owners) {
        const custodyParties = (owners || []).map((s) => String(s || '').trim()).filter(Boolean);
        try {
            const { policyId, contractAddress } = this.plutusHelper.getScripts(custodyParties);
            return { schemeReference: policyId, custodyVaultAddress: contractAddress };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Không lấy được cấu hình custody: ${error.message}`);
        }
    }
    async createUnsignedCreateTx(dto, signerAddressRaw) {
        const walletAddress = String(signerAddressRaw || '').trim();
        const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
        const code = String(dto.assetName || '').trim() || this.generateCode();
        if (!walletAddress)
            throw new common_1.BadRequestException('Không xác định được địa chỉ ký từ phiên đăng nhập.');
        if (owners.length === 0)
            throw new common_1.BadRequestException('Danh sách owners là bắt buộc.');
        const metadata = this.stringifyMetadata(dto.metadata);
        metadata.production_code = metadata.production_code || code;
        return this.buildUnsignedMintResult(walletAddress, owners, [{ productName: code, metadata }]);
    }
    async createUnsignedBatchCreateTx(dto, signerAddressRaw) {
        const walletAddress = String(signerAddressRaw || '').trim();
        const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
        if (!walletAddress)
            throw new common_1.BadRequestException('Không xác định được địa chỉ ký từ phiên đăng nhập.');
        if (owners.length === 0)
            throw new common_1.BadRequestException('Danh sách owners là bắt buộc.');
        const rawItems = Array.isArray(dto.items) ? dto.items : [];
        if (rawItems.length === 0 || rawItems.length > 5) {
            throw new common_1.BadRequestException('items phải có từ 1 đến 5 mục.');
        }
        const products = rawItems.map((item, index) => {
            const code = String(item?.assetName || '').trim() || `${this.generateCode()}_${index + 1}`;
            const metadata = this.stringifyMetadata(item?.metadata);
            metadata.production_code = metadata.production_code || metadata.container_code || code;
            return { productName: code, metadata };
        });
        return this.buildUnsignedMintResult(walletAddress, owners, products);
    }
    async buildUnsignedMintResult(walletAddress, owners, products) {
        const unsignedTx = await this.txBuilderHelper.buildMintTx(walletAddress, owners, products.map((product) => ({ ...product, quantity: '1' })));
        const { policyId } = this.plutusHelper.getScripts(owners);
        const items = products.map((product) => {
            const assetName = String(product.productName || '').trim();
            return {
                assetName,
                inventoryKey: policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)),
            };
        });
        const first = items[0];
        return {
            result: true,
            data: unsignedTx,
            message: 'Đã chuẩn bị bản ghi sản xuất.',
            traceSchemeRef: policyId,
            assetName: first?.assetName || '',
            inventoryKey: first?.inventoryKey || '',
            items,
        };
    }
    async createUnsignedSaveTx(dto, signerAddressRaw) {
        const walletAddress = String(signerAddressRaw || '').trim();
        const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
        const inventoryKey = String(dto.inventoryKey || '').trim();
        if (!walletAddress)
            throw new common_1.BadRequestException('Không xác định được địa chỉ ký từ phiên đăng nhập.');
        if (owners.length === 0)
            throw new common_1.BadRequestException('Danh sách owners là bắt buộc.');
        let ownersForSave = owners;
        let onchain = await this.loadOnchainMetadata(ownersForSave, inventoryKey);
        if (!onchain) {
            const fallbackOwners = await this.loadOwnersFromInventoryKey(inventoryKey);
            if (fallbackOwners.length > 0) {
                ownersForSave = fallbackOwners;
                onchain = await this.loadOnchainMetadata(ownersForSave, inventoryKey);
            }
        }
        const merged = {};
        for (const [k, v] of Object.entries(onchain || {})) {
            merged[String(k)] = String(v ?? '').trim();
        }
        for (const [k, v] of Object.entries(this.stringifyMetadata(dto.metadata))) {
            merged[String(k)] = String(v ?? '').trim();
        }
        const code = this.decodeAssetNameFromUnit(inventoryKey);
        if (!code)
            throw new common_1.BadRequestException('Không giải mã được tên asset từ inventoryKey.');
        merged.production_code = merged.production_code || code;
        const unsignedTx = await this.txBuilderHelper.buildUpdateTx(walletAddress, ownersForSave, [
            { productName: code, metadata: merged },
        ]);
        return { result: true, data: unsignedTx, message: 'Đã chuẩn bị bản ghi cập nhật hợp đồng.' };
    }
    async createUnsignedBurnTx(dto, signerAddressRaw) {
        const walletAddress = String(signerAddressRaw || '').trim();
        const owners = Array.isArray(dto?.owners) ? dto.owners.map((s) => String(s || '').trim()).filter(Boolean) : [];
        const productionInventoryKeys = Array.isArray(dto?.productionInventoryKeys)
            ? dto.productionInventoryKeys.map((s) => String(s || '').trim()).filter(Boolean)
            : [];
        if (!walletAddress)
            throw new common_1.BadRequestException('Không xác định được địa chỉ ký từ phiên đăng nhập.');
        if (owners.length === 0)
            throw new common_1.BadRequestException('Danh sách owners là bắt buộc.');
        const products = Array.from(new Set(productionInventoryKeys))
            .map((inventoryKey) => this.decodeAssetNameFromUnit(inventoryKey))
            .filter((productName) => String(productName || '').trim())
            .map((productName) => ({ productName }));
        if (products.length === 0) {
            throw new common_1.BadRequestException('productionInventoryKeys là bắt buộc.');
        }
        const unsignedTx = await this.txBuilderHelper.buildBurnTx(walletAddress, owners, products);
        return { result: true, data: unsignedTx, message: 'Đã chuẩn bị giao dịch burn hợp đồng.' };
    }
};
exports.ContractService = ContractService;
exports.ContractService = ContractService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ContractService);
//# sourceMappingURL=contract.service.js.map