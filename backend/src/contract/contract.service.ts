import { BadRequestException, Injectable } from '@nestjs/common';
import { BlockfrostProvider, CIP68_100, stringToHex } from '@meshsdk/core';
import { deserializeDatum } from '../utils/deserialize-datum';
import { TxBuilderHelper } from './helpers/tx-builder.helper';
import { PlutusHelper } from './helpers/plutus.helper';
import { ContractCreateDto } from './dto/contract-create.dto';
import { ContractBatchCreateDto } from './dto/contract-batch-create.dto';
import { ContractSaveDto } from './dto/contract-save.dto';
import { ContractBurnDto } from './dto/contract-burn.dto';

@Injectable()
export class ContractService {
  private readonly blockfrostProvider: BlockfrostProvider;
  private readonly plutusHelper: PlutusHelper;
  private readonly txBuilderHelper: TxBuilderHelper;

  constructor() {
    const apiKey = process.env.BLOCKFROST_API_KEY;
    if (!apiKey) throw new Error('Chưa cấu hình BLOCKFROST_API_KEY trên server.');
    this.blockfrostProvider = new BlockfrostProvider(apiKey);
    this.plutusHelper = new PlutusHelper();
    this.txBuilderHelper = new TxBuilderHelper(this.blockfrostProvider, this.plutusHelper, apiKey);
  }

  private generateCode(): string {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    const time = Date.now().toString(36).slice(-8).toUpperCase();
    return `VU-${time}-${rand}`;
  }

  private decodeAssetNameFromUnit(unit: string): string {
    const u = String(unit || '').trim();
    if (!u || u.length <= 56) return '';
    const rest = u.slice(56);
    const label = CIP68_100('');
    const hex = rest.startsWith(label) ? rest.slice(label.length) : rest;
    if (!hex || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) return '';
    try {
      const bytes = hex.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || [];
      return new TextDecoder().decode(new Uint8Array(bytes));
    } catch {
      return '';
    }
  }

  private async loadOnchainMetadata(
    owners: string[],
    inventoryKey: string,
  ): Promise<Record<string, unknown> | null> {
    const { policyId, contractAddress } = this.plutusHelper.getScripts(owners);
    const assetName = this.decodeAssetNameFromUnit(inventoryKey);
    if (!assetName) return null;
    const referenceUnit = policyId + CIP68_100(stringToHex(assetName));
    const utxos = await this.blockfrostProvider.fetchAddressUTxOs(contractAddress, referenceUnit);
    const ref = utxos.length > 0 ? (utxos[utxos.length - 1] as any) : null;
    if (!ref) return null;
    const datumHex =
      String(ref?.output?.plutusData || '').trim() ||
      String(ref?.output?.datum || '').trim() ||
      String(ref?.output?.inlineDatum || '').trim();
    if (!datumHex) return null;
    return await deserializeDatum(datumHex.startsWith('0x') ? datumHex.slice(2) : datumHex);
  }

  private blockfrostBaseUrl(): string {
    const network = String(process.env.APP_NETWORK || 'preprod').trim().toLowerCase();
    if (network === 'mainnet') return 'https://cardano-mainnet.blockfrost.io/api/v0';
    if (network === 'preview') return 'https://cardano-preview.blockfrost.io/api/v0';
    return 'https://cardano-preprod.blockfrost.io/api/v0';
  }

  private parseOwners(raw: unknown): string[] {
    if (Array.isArray(raw)) return raw.map((x) => String(x || '').trim()).filter(Boolean);
    const text = String(raw || '').trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map((x) => String(x || '').trim()).filter(Boolean);
    } catch {}
    return [];
  }

  private parseOwnersFromMetadata(metadata: any): string[] {
    const fromOwners = this.parseOwners(metadata?.owners);
    if (fromOwners.length > 0) return fromOwners;
    return this.parseOwners(metadata?.participant_wallet_addresses);
  }

  private async loadOwnersFromInventoryKey(inventoryKey: string): Promise<string[]> {
    const unit = String(inventoryKey || '').trim().toLowerCase();
    const apiKey = String(process.env.BLOCKFROST_API_KEY || '').trim();
    if (!unit || !apiKey) return [];
    const txRes = await fetch(
      `${this.blockfrostBaseUrl()}/assets/${encodeURIComponent(unit)}/transactions?count=1&page=1&order=desc`,
      { headers: { project_id: apiKey } },
    );
    if (txRes.status !== 200) return [];
    const txRows = (await txRes.json().catch(() => [])) as any[];
    const txHash = String(txRows?.[0]?.tx_hash || '').trim();
    if (!txHash) return [];
    const utxoRes = await fetch(
      `${this.blockfrostBaseUrl()}/txs/${encodeURIComponent(txHash)}/utxos`,
      { headers: { project_id: apiKey } },
    );
    if (utxoRes.status !== 200) return [];
    const utxos = (await utxoRes.json().catch(() => null)) as any;
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
      if (!hasUnit) continue;
      const datumHex = String(output?.inline_datum || '').trim();
      if (!datumHex) continue;
      const metadata = (await deserializeDatum(datumHex.startsWith('0x') ? datumHex.slice(2) : datumHex)) as any;
      const owners = this.parseOwnersFromMetadata(metadata);
      if (owners.length > 0) return Array.from(new Set(owners));
    }
    return [];
  }


  private stringifyMetadata(metadata: Record<string, string> | undefined) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(metadata || {})) {
      out[String(k)] = String(v ?? '').trim();
    }
    return out;
  }

  async getInfo(owners: string[]) {
    const custodyParties = (owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    try {
      const { policyId, contractAddress } = this.plutusHelper.getScripts(custodyParties);
      return { schemeReference: policyId, custodyVaultAddress: contractAddress };
    } catch (error: any) {
      throw new BadRequestException(`Không lấy được cấu hình custody: ${error.message}`);
    }
  }

  async createUnsignedCreateTx(dto: ContractCreateDto, signerAddressRaw: unknown) {
    const walletAddress = String(signerAddressRaw || '').trim();
    const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const code = String(dto.assetName || '').trim() || this.generateCode();
    if (!walletAddress) throw new BadRequestException('Không xác định được địa chỉ ký từ phiên đăng nhập.');
    if (owners.length === 0) throw new BadRequestException('Danh sách owners là bắt buộc.');

    const metadata = this.stringifyMetadata(dto.metadata);
    metadata.production_code = metadata.production_code || code;

    return this.buildUnsignedMintResult(walletAddress, owners, [{ productName: code, metadata }]);
  }

  async createUnsignedBatchCreateTx(dto: ContractBatchCreateDto, signerAddressRaw: unknown) {
    const walletAddress = String(signerAddressRaw || '').trim();
    const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    if (!walletAddress) throw new BadRequestException('Không xác định được địa chỉ ký từ phiên đăng nhập.');
    if (owners.length === 0) throw new BadRequestException('Danh sách owners là bắt buộc.');

    const rawItems = Array.isArray(dto.items) ? dto.items : [];
    if (rawItems.length === 0 || rawItems.length > 5) {
      throw new BadRequestException('items phải có từ 1 đến 5 mục.');
    }

    const products = rawItems.map((item, index) => {
      const code = String(item?.assetName || '').trim() || `${this.generateCode()}_${index + 1}`;
      const metadata = this.stringifyMetadata(item?.metadata);
      metadata.production_code = metadata.production_code || metadata.container_code || code;
      return { productName: code, metadata };
    });

    return this.buildUnsignedMintResult(walletAddress, owners, products);
  }

  private async buildUnsignedMintResult(
    walletAddress: string,
    owners: string[],
    products: Array<{ productName: string; metadata: Record<string, string> }>,
  ) {
    const unsignedTx = await this.txBuilderHelper.buildMintTx(
      walletAddress,
      owners,
      products.map((product) => ({ ...product, quantity: '1' })),
    );
    const { policyId } = this.plutusHelper.getScripts(owners);
    const items = products.map((product) => {
      const assetName = String(product.productName || '').trim();
      return {
        assetName,
        inventoryKey: policyId + CIP68_100(stringToHex(assetName)),
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

  async createUnsignedSaveTx(dto: ContractSaveDto, signerAddressRaw: unknown) {
    const walletAddress = String(signerAddressRaw || '').trim();
    const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const inventoryKey = String(dto.inventoryKey || '').trim();
    if (!walletAddress) throw new BadRequestException('Không xác định được địa chỉ ký từ phiên đăng nhập.');
    if (owners.length === 0) throw new BadRequestException('Danh sách owners là bắt buộc.');

    let ownersForSave = owners;
    let onchain = await this.loadOnchainMetadata(ownersForSave, inventoryKey);
    if (!onchain) {
      const fallbackOwners = await this.loadOwnersFromInventoryKey(inventoryKey);
      if (fallbackOwners.length > 0) {
        ownersForSave = fallbackOwners;
        onchain = await this.loadOnchainMetadata(ownersForSave, inventoryKey);
      }
    }
    const merged: Record<string, string> = {};
    for (const [k, v] of Object.entries(onchain || {})) {
      merged[String(k)] = String(v ?? '').trim();
    }
    for (const [k, v] of Object.entries(this.stringifyMetadata(dto.metadata))) {
      merged[String(k)] = String(v ?? '').trim();
    }

    const code = this.decodeAssetNameFromUnit(inventoryKey);
    if (!code) throw new BadRequestException('Không giải mã được tên asset từ inventoryKey.');
    merged.production_code = merged.production_code || code;

    const unsignedTx = await this.txBuilderHelper.buildUpdateTx(walletAddress, ownersForSave, [
      { productName: code, metadata: merged },
    ]);
    return { result: true, data: unsignedTx, message: 'Đã chuẩn bị bản ghi cập nhật hợp đồng.' };
  }

  async createUnsignedBurnTx(dto: ContractBurnDto, signerAddressRaw: unknown) {
    const walletAddress = String(signerAddressRaw || '').trim();
    const owners = Array.isArray(dto?.owners) ? dto.owners.map((s: unknown) => String(s || '').trim()).filter(Boolean) : [];
    const productionInventoryKeys = Array.isArray(dto?.productionInventoryKeys)
      ? dto.productionInventoryKeys.map((s: unknown) => String(s || '').trim()).filter(Boolean)
      : [];
    if (!walletAddress) throw new BadRequestException('Không xác định được địa chỉ ký từ phiên đăng nhập.');
    if (owners.length === 0) throw new BadRequestException('Danh sách owners là bắt buộc.');

    const products = Array.from(new Set(productionInventoryKeys))
      .map((inventoryKey) => this.decodeAssetNameFromUnit(inventoryKey))
      .filter((productName) => String(productName || '').trim())
      .map((productName) => ({ productName }));
    if (products.length === 0) {
      throw new BadRequestException('productionInventoryKeys là bắt buộc.');
    }
    const unsignedTx = await this.txBuilderHelper.buildBurnTx(walletAddress, owners, products);
    return { result: true, data: unsignedTx, message: 'Đã chuẩn bị giao dịch burn hợp đồng.' };
  }
}
