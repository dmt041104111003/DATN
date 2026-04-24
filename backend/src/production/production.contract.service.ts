import { BadRequestException, Injectable } from '@nestjs/common';
import { BlockfrostProvider, CIP68_100, stringToHex } from '@meshsdk/core';
import { deserializeDatum } from '../utils/deserialize-datum';
import { TxBuilderHelper } from './helpers/tx-builder.helper';
import { PlutusHelper } from './helpers/plutus.helper';
import { ProductionContractCreateDto } from './dto/production-contract-create.dto';
import { ProductionContractSaveDto } from './dto/production-contract-save.dto';

@Injectable()
export class ProductionContractService {
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

  async createUnsignedCreateTx(dto: ProductionContractCreateDto) {
    const walletAddress = String(dto.custodianAddress || '').trim();
    const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const code = String(dto.assetName || '').trim() || this.generateCode();
    if (!walletAddress) throw new BadRequestException('custodianAddress is required.');
    if (owners.length === 0) throw new BadRequestException('owners is required.');
    if (!owners.includes(walletAddress)) {
      throw new BadRequestException('The signing custodian must appear on the joint custody list.');
    }

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

  async createUnsignedSaveTx(dto: ProductionContractSaveDto) {
    const walletAddress = String(dto.custodianAddress || '').trim();
    const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const inventoryKey = String(dto.inventoryKey || '').trim();
    if (!walletAddress) throw new BadRequestException('custodianAddress is required.');
    if (owners.length === 0) throw new BadRequestException('owners is required.');
    if (!owners.includes(walletAddress)) {
      throw new BadRequestException('Your account is not on the joint custody list.');
    }
    if (!inventoryKey) throw new BadRequestException('inventoryKey is required.');

    const onchain = await this.loadOnchainMetadata(owners, inventoryKey);
    if (!onchain) throw new BadRequestException('Production on-chain metadata was not found.');

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
    return { result: true, data: unsignedTx, message: 'Production refresh record prepared.' };
  }
}
