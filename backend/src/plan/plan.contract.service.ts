import { BadRequestException, Injectable } from '@nestjs/common';
import { CIP68_100, CIP68_222, stringToHex, BlockfrostProvider } from '@meshsdk/core';
import { PrismaService } from '../prisma/prisma.service';
import { buildPlanPassport } from './plan.contract.helper';
import { PlanContractCreateDto } from './dto/plan-contract-create.dto';
import { PlanContractDeleteDto } from './dto/plan-contract-delete.dto';
import { PlanContractSaveDto } from './dto/plan-contract-save.dto';
import { PlutusHelper } from './helpers/plutus.helper';
import { TxBuilderHelper } from './helpers/tx-builder.helper';
import { deserializeDatum } from '../utils/deserialize-datum';

@Injectable()
export class PlanContractService {
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

  private generateAssetName(prefix: 'PLAN'): string {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    const time = Date.now().toString(36).slice(-8).toUpperCase();
    return `${prefix}-${time}-${rand}`;
  }

  private async findPlanByInventoryKey(inventoryKey: string) {
    const key = String(inventoryKey || '').trim();
    if (!key) return null;
    return await (this.prisma as any).plan.findUnique({ where: { inventoryKey: key } });
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

  private toIsoOrNull(v: any): string | null {
    try {
      if (!v) return null;
      const d = v instanceof Date ? v : new Date(v);
      if (Number.isNaN(d.getTime())) return null;
      return d.toISOString();
    } catch {
      return null;
    }
  }

  private buildCreateJsonFromPlan(plan: any): Record<string, unknown> {
    return {
      plannedSeedingDate: this.toIsoOrNull(plan?.plannedSeedingDate),
      plannedPlantingDate: this.toIsoOrNull(plan?.plannedPlantingDate),
      nurseryBatch: plan?.nurseryBatch ?? null,
      plantingBatch: plan?.plantingBatch ?? null,
      nurseryArea: plan?.nurseryArea ?? null,
      plantingArea: plan?.plantingArea ?? null,
      seedQuantityValue: plan?.seedQuantityValue ?? null,
      seedQuantityUnit: plan?.seedQuantityUnit ?? null,
      plantQuantityValue: plan?.plantQuantityValue ?? null,
      plantQuantityUnit: plan?.plantQuantityUnit ?? null,
    };
  }

  private buildHarvestJsonFromPlan(plan: any): Record<string, unknown> {
    return {
      plannedHarvestDate: this.toIsoOrNull(plan?.plannedHarvestDate),
      plannedProcessingDate: this.toIsoOrNull(plan?.plannedProcessingDate),
      expectedHarvestYield: plan?.expectedHarvestYield ?? null,
      expectedProcessingYield: plan?.expectedProcessingYield ?? null,
      harvestImageIpfs: String(plan?.harvestImageIpfs || '').trim() || null,
    };
  }

  private buildPackagingJsonFromPlan(plan: any): Record<string, unknown> {
    return {
      plannedPackagingDate: this.toIsoOrNull(plan?.plannedPackagingDate),
      expiryDate: this.toIsoOrNull(plan?.expiryDate),
      expectedPackagingQuantity: plan?.expectedPackagingQuantity ?? null,
      packagingSpec: plan?.packagingSpec ?? null,
      packagingImageIpfs: String(plan?.packagingImageIpfs || '').trim() || null,
    };
  }

  private mergeLegacyFromStages(stages: {
    createJson?: Record<string, unknown>;
    harvestJson?: Record<string, unknown>;
    packagingJson?: Record<string, unknown>;
  }): { plannedTimeline: Record<string, unknown>; quantities: Record<string, unknown> } {
    const c = stages.createJson ?? {};
    const h = stages.harvestJson ?? {};
    const p = stages.packagingJson ?? {};

    const plannedTimeline: Record<string, unknown> = {
      plannedSeedingDate: c.plannedSeedingDate,
      plannedPlantingDate: c.plannedPlantingDate,
      nurseryBatch: c.nurseryBatch,
      plantingBatch: c.plantingBatch,
      nurseryArea: c.nurseryArea,
      plantingArea: c.plantingArea,
      plannedHarvestDate: h.plannedHarvestDate,
      plannedProcessingDate: h.plannedProcessingDate,
      plannedPackagingDate: p.plannedPackagingDate,
      expiryDate: p.expiryDate,
      packagingSpec: p.packagingSpec,
    };

    const quantities: Record<string, unknown> = {
      seedQuantityValue: c.seedQuantityValue,
      seedQuantityUnit: c.seedQuantityUnit,
      plantQuantityValue: c.plantQuantityValue,
      plantQuantityUnit: c.plantQuantityUnit,
      expectedHarvestYield: h.expectedHarvestYield,
      expectedProcessingYield: h.expectedProcessingYield,
      expectedPackagingQuantity: p.expectedPackagingQuantity,
    };

    return { plannedTimeline, quantities };
  }

  private safeJsonParseObject(raw: unknown): Record<string, unknown> {
    const s = String(raw ?? '').trim();
    if (!s) return {};
    try {
      const v = JSON.parse(s);
      if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
      return {};
    } catch {
      return {};
    }
  }

  private pickKeys(src: Record<string, unknown>, keys: string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(src, k)) out[k] = src[k];
    }
    return out;
  }

  private omitKeys(src: Record<string, unknown>, keys: string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    const deny = new Set(keys);
    for (const [k, v] of Object.entries(src)) {
      if (!deny.has(k)) out[k] = v;
    }
    return out;
  }

  private decodeAssetNameFromUnit(unit: string): string {
    const u = String(unit || '').trim();
    if (!u || u.length <= 56) return '';
    const policy = u.slice(0, 56);
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

  private async loadOnchainPassport(owners: string[], inventoryKey: string): Promise<Record<string, unknown> | null> {
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

  async createUnsignedCreateTx(input: PlanContractCreateDto) {
    const signer = String(input.custodianAddress || '').trim();
    const owners = (input.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const assetName =
      String((input as any).assetName || '').trim() || this.generateAssetName('PLAN');
    const cropType = String(input.cropType || '').trim();
    const growingAreaInventoryKey = String((input as any).growingAreaInventoryKey || '').trim();

    if (!signer) throw new BadRequestException('custodianAddress is required.');
    if (owners.length === 0) throw new BadRequestException('owners is required.');
    if (!owners.includes(signer)) {
      throw new BadRequestException('The signing custodian must appear on the joint custody list.');
    }
    if (!growingAreaInventoryKey) throw new BadRequestException('growingAreaInventoryKey is required.');
    if (!cropType) throw new BadRequestException('cropType is required.');

    const growingArea = await (this.prisma as any).growingArea.findUnique({
      where: { inventoryKey: growingAreaInventoryKey },
      select: { inventoryKey: true },
    });
    if (!growingArea) throw new BadRequestException('Growing area was not found.');

    const passport = buildPlanPassport({
      growingAreaSnapshot: {
        inventoryKey: growingArea.inventoryKey,
      },
      cropType,
      seedCertificateIpfs: String(input.seedCertificateIpfs || '').trim() || null,
      seedInvoiceIpfs: String(input.seedInvoiceIpfs || '').trim() || null,
      harvestImageIpfs: String(input.harvestImageIpfs || '').trim() || null,
      packagingImageIpfs: String(input.packagingImageIpfs || '').trim() || null,
      createJson: {
        ...(input.plannedTimeline || {}),
        ...(input.quantities || {}),
      },
      harvestJson: {},
      packagingJson: {},
      ...this.mergeLegacyFromStages({
        createJson: { ...(input.plannedTimeline || {}), ...(input.quantities || {}) },
        harvestJson: {},
        packagingJson: {},
      }),
    });

    const unsignedTx = await this.txBuilderHelper.buildMintTx(
      signer,
      owners,
      [{ productName: assetName, metadata: passport, quantity: '1' }],
    );

    const { policyId } = this.plutusHelper.getScripts(owners);
    const inventoryKey = policyId + CIP68_100(stringToHex(assetName));
    return {
      result: true,
      data: unsignedTx,
      message: 'Plan record prepared.',
      traceSchemeRef: policyId,
      assetName,
      inventoryKey,
    };
  }

  async createUnsignedDeleteTx(input: PlanContractDeleteDto) {
    const walletAddress = String(input.custodianAddress || '').trim();
    const owners = (input.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const inventoryKey = String((input as any).inventoryKey || '').trim();

    if (!walletAddress) throw new BadRequestException('custodianAddress is required.');
    if (owners.length === 0) throw new BadRequestException('owners is required.');
    if (!inventoryKey) throw new BadRequestException('inventoryKey is required.');
    if (!owners.includes(walletAddress)) {
      throw new BadRequestException('Your account is not on the joint custody list.');
    }

    const { policyId } = this.plutusHelper.getScripts(owners);
    const assetName = this.decodeAssetNameFromUnit(inventoryKey);
    if (!assetName) throw new BadRequestException('Unable to decode asset name from inventoryKey.');
    const holds = await this.txBuilderHelper.getAddressUTXOAssets(
      walletAddress,
      policyId + CIP68_222(stringToHex(assetName)),
    );
    if (!holds || holds.length === 0) {
      throw new BadRequestException('This custodian is not carrying the movement credential for this plan.');
    }

    const unsignedTx = await this.txBuilderHelper.buildBurnTx(walletAddress, owners, [
      { productName: assetName },
    ]);
    return { result: true, data: unsignedTx, message: 'Plan close record prepared.' };
  }

  async createUnsignedSaveTx(input: PlanContractSaveDto) {
    const walletAddress = String(input.custodianAddress || '').trim();
    const owners = (input.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const inventoryKey = String((input as any).inventoryKey || '').trim();
    const cropType = String(input.cropType || '').trim();

    if (!walletAddress) throw new BadRequestException('custodianAddress is required.');
    if (owners.length === 0) throw new BadRequestException('owners is required.');
    if (!inventoryKey) throw new BadRequestException('inventoryKey is required.');
    if (!cropType) throw new BadRequestException('cropType is required.');
    if (!owners.includes(walletAddress)) {
      throw new BadRequestException('Your account is not on the joint custody list.');
    }

    const onchain = await this.loadOnchainPassport(owners, inventoryKey);
    if (!onchain) throw new BadRequestException('Plan on-chain passport was not found.');

    const createKeys = [
      'plannedSeedingDate',
      'plannedPlantingDate',
      'nurseryBatch',
      'plantingBatch',
      'nurseryArea',
      'plantingArea',
      'seedQuantityValue',
      'seedQuantityUnit',
      'plantQuantityValue',
      'plantQuantityUnit',
    ];
    const harvestKeys = [
      'plannedHarvestDate',
      'plannedProcessingDate',
      'expectedHarvestYield',
      'expectedProcessingYield',
      'harvestImageIpfs',
    ];
    const packagingKeys = [
      'plannedPackagingDate',
      'expiryDate',
      'expectedPackagingQuantity',
      'packagingSpec',
      'packagingImageIpfs',
    ];
    const allStageKeys = [...createKeys, ...harvestKeys, ...packagingKeys];

    const incoming = {
      ...(input.plannedTimeline || {}),
      ...(input.quantities || {}),
    } as Record<string, unknown>;

    const existingCreate = this.safeJsonParseObject((onchain as any).create_json);
    const existingHarvest = this.safeJsonParseObject((onchain as any).harvest_json);
    const existingPackaging = this.safeJsonParseObject((onchain as any).packaging_json);

    const nextCreate = {
      ...existingCreate,
      ...this.pickKeys(incoming, createKeys),
    };
    const nextHarvest = {
      ...existingHarvest,
      ...this.pickKeys(incoming, harvestKeys),
      ...(String(input.harvestImageIpfs || '').trim() ? { harvestImageIpfs: String(input.harvestImageIpfs || '').trim() } : {}),
    };
    const nextPackaging = {
      ...existingPackaging,
      ...this.pickKeys(incoming, packagingKeys),
      ...(String(input.packagingImageIpfs || '').trim()
        ? { packagingImageIpfs: String(input.packagingImageIpfs || '').trim() }
        : {}),
    };

    const legacy = this.mergeLegacyFromStages({
      createJson: nextCreate,
      harvestJson: nextHarvest,
      packagingJson: nextPackaging,
    });

    const snapshot = this.safeJsonParseObject((onchain as any).growing_area);

    const passport = buildPlanPassport({
      growingAreaSnapshot: snapshot,
      cropType,
      seedCertificateIpfs:
        String(input.seedCertificateIpfs || '').trim() || String((onchain as any).certificate || '').trim() || null,
      seedInvoiceIpfs:
        String(input.seedInvoiceIpfs || '').trim() || String((onchain as any).invoice || '').trim() || null,
      harvestImageIpfs:
        String(input.harvestImageIpfs || '').trim() || String((onchain as any).harvest_image || '').trim() || null,
      packagingImageIpfs:
        String(input.packagingImageIpfs || '').trim() || String((onchain as any).packaging_image || '').trim() || null,
      createJson: nextCreate,
      harvestJson: nextHarvest,
      packagingJson: nextPackaging,
      plannedTimeline: legacy.plannedTimeline,
      quantities: legacy.quantities,
    });

    const assetName = this.decodeAssetNameFromUnit(inventoryKey);
    if (!assetName) throw new BadRequestException('Unable to decode asset name from inventoryKey.');

    const unsignedTx = await this.txBuilderHelper.buildUpdateTx(walletAddress, owners, [
      { productName: assetName, metadata: passport },
    ]);

    return { result: true, data: unsignedTx, message: 'Plan refresh record prepared.' };
  }
}

