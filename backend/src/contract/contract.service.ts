import { BadRequestException, Injectable } from '@nestjs/common';
import { BlockfrostProvider, CIP68_100, stringToHex } from '@meshsdk/core';
import { deserializeDatum } from '../utils/deserialize-datum';
import { TxBuilderHelper } from './helpers/tx-builder.helper';
import { PlutusHelper } from './helpers/plutus.helper';
import { ContractCreateDto } from './dto/contract-create.dto';
import { ContractSaveDto } from './dto/contract-save.dto';
import { ContractBurnDto } from './dto/contract-burn.dto';

@Injectable()
export class ContractService {
  private readonly blockfrostProvider: BlockfrostProvider;
  private readonly plutusHelper: PlutusHelper;
  private readonly txBuilderHelper: TxBuilderHelper;

  constructor() {
    const apiKey = process.env.BLOCKFROST_API_KEY;
    if (!apiKey) throw new Error('BLOCKFROST_API_KEY is not set');
    this.blockfrostProvider = new BlockfrostProvider(apiKey);
    this.plutusHelper = new PlutusHelper();
    this.txBuilderHelper = new TxBuilderHelper(this.blockfrostProvider, this.plutusHelper);
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
      throw new BadRequestException(`Unable to resolve custody configuration: ${error.message}`);
    }
  }

  async createUnsignedCreateTx(dto: ContractCreateDto, signerAddressRaw: unknown) {
    const walletAddress = String(signerAddressRaw || '').trim();
    const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const code = String(dto.assetName || '').trim() || this.generateCode();
    if (!walletAddress) throw new BadRequestException('Unable to determine signer address from session.');
    if (owners.length === 0) throw new BadRequestException('owners is required.');

    const metadata = this.stringifyMetadata(dto.metadata);
    metadata.production_code = metadata.production_code || code;

    const unsignedTx = await this.txBuilderHelper.buildMintTx(walletAddress, owners, [
      { productName: code, metadata, quantity: '1' },
    ]);
    const { policyId } = this.plutusHelper.getScripts(owners);
    const inventoryKey = policyId + CIP68_100(stringToHex(code));
    return {
      result: true,
      data: unsignedTx,
      message: 'Production record prepared.',
      traceSchemeRef: policyId,
      assetName: code,
      inventoryKey,
    };
  }

  async createUnsignedSaveTx(dto: ContractSaveDto, signerAddressRaw: unknown) {
    const walletAddress = String(signerAddressRaw || '').trim();
    const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const inventoryKey = String(dto.inventoryKey || '').trim();
    if (!walletAddress) throw new BadRequestException('Unable to determine signer address from session.');
    if (owners.length === 0) throw new BadRequestException('owners is required.');

    const onchain = await this.loadOnchainMetadata(owners, inventoryKey);
    const merged: Record<string, string> = {};
    for (const [k, v] of Object.entries(onchain || {})) {
      merged[String(k)] = String(v ?? '').trim();
    }
    for (const [k, v] of Object.entries(this.stringifyMetadata(dto.metadata))) {
      merged[String(k)] = String(v ?? '').trim();
    }

    const code = this.decodeAssetNameFromUnit(inventoryKey);
    if (!code) throw new BadRequestException('Unable to decode asset name from inventoryKey.');
    merged.production_code = merged.production_code || code;

    const unsignedTx = await this.txBuilderHelper.buildUpdateTx(walletAddress, owners, [
      { productName: code, metadata: merged },
    ]);
    return { result: true, data: unsignedTx, message: 'Contract refresh record prepared.' };
  }

  async createUnsignedBurnTx(dto: ContractBurnDto, signerAddressRaw: unknown) {
    const walletAddress = String(signerAddressRaw || '').trim();
    const owners = Array.isArray(dto?.owners) ? dto.owners.map((s: unknown) => String(s || '').trim()).filter(Boolean) : [];
    const productionInventoryKeys = Array.isArray(dto?.productionInventoryKeys)
      ? dto.productionInventoryKeys.map((s: unknown) => String(s || '').trim()).filter(Boolean)
      : [];
    if (!walletAddress) throw new BadRequestException('Unable to determine signer address from session.');
    if (owners.length === 0) throw new BadRequestException('owners is required.');

    const products = Array.from(new Set(productionInventoryKeys))
      .map((inventoryKey) => this.decodeAssetNameFromUnit(inventoryKey))
      .filter((productName) => String(productName || '').trim())
      .map((productName) => ({ productName }));
    if (products.length === 0) {
      throw new BadRequestException('productionInventoryKeys is required.');
    }
    const unsignedTx = await this.txBuilderHelper.buildBurnTx(walletAddress, owners, products);
    return { result: true, data: unsignedTx, message: 'Contract burn prepared.' };
  }
}
