import { BadRequestException, Injectable } from '@nestjs/common';
import { BlockfrostProvider, CIP68_100, stringToHex } from '@meshsdk/core';
import { deserializeDatum } from '../utils/deserialize-datum';
import { TxBuilderHelper } from '../production/helpers/tx-builder.helper';
import { PlutusHelper } from '../production/helpers/plutus.helper';
import { ContainerContractCreateDto } from './dto/container-contract-create.dto';
import { ContainerContractSaveDto } from './dto/container-contract-save.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContainerContractService {
  private readonly blockfrostProvider: BlockfrostProvider;
  private readonly plutusHelper: PlutusHelper;
  private readonly txBuilderHelper: TxBuilderHelper;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.BLOCKFROST_API_KEY;
    if (!apiKey) throw new Error('BLOCKFROST_API_KEY is not set');
    this.blockfrostProvider = new BlockfrostProvider(apiKey);
    this.plutusHelper = new PlutusHelper();
    this.txBuilderHelper = new TxBuilderHelper(this.blockfrostProvider, this.plutusHelper);
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

  private stringifyMetadata(metadata: Record<string, string> | undefined) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(metadata || {})) {
      out[String(k)] = String(v ?? '').trim();
    }
    return out;
  }

  private async loadOnchainMetadata(owners: string[], inventoryKey: string): Promise<Record<string, unknown> | null> {
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

  async getInfo(owners: string[]) {
    const custodyParties = (owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const { policyId, contractAddress } = this.plutusHelper.getScripts(custodyParties);
    return { schemeReference: policyId, custodyVaultAddress: contractAddress };
  }

  async createUnsignedCreateTx(dto: ContainerContractCreateDto) {
    const walletAddress = String(dto.custodianAddress || '').trim();
    const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const code = String(dto.assetName || '').trim();
    if (owners.length === 0 && walletAddress) owners.push(walletAddress);
    if (!owners.includes(walletAddress)) owners.push(walletAddress);
    if (!code) throw new BadRequestException('Container code is required.');

    const metadata = this.stringifyMetadata(dto.metadata);
    metadata.container_code = metadata.container_code || code;
    const unsignedTx = await this.txBuilderHelper.buildMintTx(walletAddress, owners, [
      { productName: code, metadata, quantity: '1' },
    ]);
    const { policyId } = this.plutusHelper.getScripts(owners);
    const inventoryKey = policyId + CIP68_100(stringToHex(code));
    return {
      result: true,
      data: unsignedTx,
      message: 'Container record prepared.',
      traceSchemeRef: policyId,
      assetName: code,
      inventoryKey,
    };
  }

  async createUnsignedSaveTx(dto: ContainerContractSaveDto) {
    const walletAddress = String(dto.custodianAddress || '').trim();
    const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const inventoryKey = String(dto.inventoryKey || '').trim();
    if (owners.length === 0 && walletAddress) owners.push(walletAddress);
    if (!owners.includes(walletAddress)) owners.push(walletAddress);

    const onchain = await this.loadOnchainMetadata(owners, inventoryKey);
    if (!onchain) throw new BadRequestException('Container on-chain metadata was not found.');
    const merged: Record<string, string> = {};
    for (const [k, v] of Object.entries(onchain || {})) {
      merged[String(k)] = String(v ?? '').trim();
    }
    for (const [k, v] of Object.entries(this.stringifyMetadata(dto.metadata))) {
      merged[String(k)] = String(v ?? '').trim();
    }

    const code = this.decodeAssetNameFromUnit(inventoryKey);
    if (!code) throw new BadRequestException('Unable to decode asset name from inventoryKey.');
    merged.container_code = merged.container_code || code;
    const unsignedTx = await this.txBuilderHelper.buildUpdateTx(walletAddress, owners, [
      { productName: code, metadata: merged },
    ]);
    return { result: true, data: unsignedTx, message: 'Container refresh record prepared.' };
  }

  async createUnsignedBurnTx(dto: any) {
    const walletAddress = String(dto?.custodianAddress || '').trim();
    const owners = Array.isArray(dto?.owners) ? dto.owners.map((s: unknown) => String(s || '').trim()).filter(Boolean) : [];
    const containerInventoryKeys = Array.isArray(dto?.containerInventoryKeys)
      ? dto.containerInventoryKeys.map((s: unknown) => String(s || '').trim()).filter(Boolean)
      : [];
    if (owners.length === 0 && walletAddress) owners.push(walletAddress);
    if (!owners.includes(walletAddress)) owners.push(walletAddress);

    const rows = await (this.prisma as any).container.findMany({
      where: { inventoryKey: { in: containerInventoryKeys } },
      select: { code: true },
    });
    const products = (rows || [])
      .map((x: any) => ({ productName: String(x?.code || '').trim() }))
      .filter((x: any) => String(x?.productName || '').trim());
    const unsignedTx = await this.txBuilderHelper.buildBurnTx(walletAddress, owners, products);
    return { result: true, data: unsignedTx, message: 'Container burn prepared.' };
  }
}
