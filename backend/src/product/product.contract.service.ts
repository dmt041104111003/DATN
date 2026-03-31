import { BadRequestException, Injectable } from '@nestjs/common';
import { CIP68_100, stringToHex, BlockfrostProvider } from '@meshsdk/core';
import { buildProductPassport } from './product.contract.helper';
import { ProductContractCreateDto } from './dto/product-contract-create.dto';
import { ProductContractSaveDto } from './dto/product-contract-save.dto';
import { ProductContractDeleteDto } from './dto/product-contract-delete.dto';
import { PlutusHelper } from './helpers/plutus.helper';
import { TxBuilderHelper } from './helpers/tx-builder.helper';
import { deserializeDatum } from '../utils/deserialize-datum';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ProductContractService {
  private readonly blockfrostProvider: BlockfrostProvider;
  private readonly plutusHelper: PlutusHelper;
  private readonly txBuilderHelper: TxBuilderHelper;
  private readonly prisma: PrismaClient;

  constructor() {
    const apiKey = process.env.BLOCKFROST_API_KEY;
    if (!apiKey) throw new Error('BLOCKFROST_API_KEY is not set');
    this.blockfrostProvider = new BlockfrostProvider(apiKey);
    this.plutusHelper = new PlutusHelper();
    this.txBuilderHelper = new TxBuilderHelper(this.blockfrostProvider, this.plutusHelper);
    this.prisma = new PrismaClient();
  }

  private generateContainerRef(): string {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    const time = Date.now().toString(36).slice(-8).toUpperCase();
    return `CTN-${time}-${rand}`;
  }

  private assertValidCapacities(passport: any) {
    const raw = String(passport?.capacities ?? '').trim();
    if (!raw) return;
    let obj: any;
    try {
      obj = JSON.parse(raw);
    } catch {
      throw new BadRequestException(
        `capacities must be a JSON string, e.g. {"maxWeightValue":"100","maxWeightUnit":"kg","maxVolumeValue":"60","maxVolumeUnit":"L"}.`,
      );
    }
    const maxWeightValue = String(obj?.maxWeightValue ?? '').trim();
    const maxWeightUnit = String(obj?.maxWeightUnit ?? '').trim();
    const maxVolumeValue = String(obj?.maxVolumeValue ?? '').trim();
    const maxVolumeUnit = String(obj?.maxVolumeUnit ?? '').trim();
    if (!maxWeightValue || !maxWeightUnit || !maxVolumeValue || !maxVolumeUnit) {
      throw new BadRequestException(
        `capacities must include maxWeightValue/maxWeightUnit/maxVolumeValue/maxVolumeUnit.`,
      );
    }
    if (!/^\d+(\.\d+)?$/.test(maxWeightValue) || !/^\d+(\.\d+)?$/.test(maxVolumeValue)) {
      throw new BadRequestException(`capacities values must be numeric strings (e.g. "10" or "10.5").`);
    }
  }

  private async maybeAttachPlanRef(passport: Record<string, string>) {
    const existingRef = String((passport as any).plan_ref || '').trim();
    const existingGA = String((passport as any).growing_area || '').trim();
    if (existingRef && existingGA) return passport;

    const planInventoryKey =
      String((passport as any).plan_inventory_key || '').trim() ||
      String((passport as any).planInventoryKey || '').trim();
    if (!planInventoryKey) return passport;

    try {
      const plan = await (this.prisma as any).plan.findUnique({
        where: { inventoryKey: planInventoryKey },
        select: {
          inventoryKey: true,
          growingAreaInventoryKey: true,
        },
      });
      if (plan) {
        const plan_ref = JSON.stringify({
          inventoryKey: plan.inventoryKey,
        });

        const ga = await (this.prisma as any).growingArea.findUnique({
          where: { inventoryKey: plan.growingAreaInventoryKey },
          select: {
            inventoryKey: true,
          },
        });
        const growing_area = ga
          ? JSON.stringify({
              inventoryKey: ga.inventoryKey,
            })
          : '';

        return {
          ...passport,
          plan_ref,
          ...(growing_area ? { growing_area } : {}),
        };
      }
    } catch {
    }

    return passport;
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

  private async loadOnchainPassport(
    owners: string[],
    lotReference: string,
  ): Promise<Record<string, unknown> | null> {
    const { policyId, contractAddress } = this.plutusHelper.getScripts(owners);
    const referenceUnit = policyId + CIP68_100(stringToHex(lotReference));
    const utxos: any[] = await this.blockfrostProvider.fetchAddressUTxOs(contractAddress, referenceUnit);
    const ref = utxos && utxos.length > 0 ? utxos[utxos.length - 1] : null;
    if (!ref) return null;
    const datumHex =
      String(ref?.output?.plutusData || '').trim() ||
      String(ref?.output?.datum || '').trim() ||
      String(ref?.output?.inlineDatum || '').trim();
    if (!datumHex) return null;
    const normalized = datumHex.startsWith('0x') ? datumHex.slice(2) : datumHex;
    return await deserializeDatum(normalized);
  }

  async createUnsignedCreateTx(dto: ProductContractCreateDto) {
    const walletAddress = String(dto.custodianAddress || '').trim();
    const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const lotReference = String(dto.lotReference || '').trim() || this.generateContainerRef();
    if (!walletAddress) throw new BadRequestException('custodianAddress is required.');
    if (owners.length === 0) throw new BadRequestException('owners is required.');
    if (!owners.includes(walletAddress)) {
      throw new BadRequestException('The signing custodian must appear on the joint custody list.');
    }

    this.assertValidCapacities(dto.passport as any);
    const withPlan = await this.maybeAttachPlanRef((dto.passport || {}) as any);
    const basePassport: any = { ...(withPlan as any) };
    if (!String(basePassport?.status ?? '').trim()) {
      basePassport.status = 'INITIAL';
    }
    const passport = buildProductPassport({ lotReference, passport: basePassport as any });
    const { policyId } = this.plutusHelper.getScripts(owners);
    const inventoryKey = policyId + CIP68_100(stringToHex(lotReference));
    const unsignedTx = await this.txBuilderHelper.buildMintTx(walletAddress, owners, [
      { productName: lotReference, metadata: passport, quantity: '1' },
    ]);
    return {
      result: true,
      data: unsignedTx,
      message: 'Lot issuance record prepared.',
      traceSchemeRef: policyId,
      lotReference,
      inventoryKey,
    };
  }

  async createUnsignedSaveTx(dto: ProductContractSaveDto) {
    const walletAddress = String(dto.custodianAddress || '').trim();
    const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const lotReference = String(dto.lotReference || '').trim();
    if (!walletAddress) throw new BadRequestException('custodianAddress is required.');
    if (owners.length === 0) throw new BadRequestException('owners is required.');
    if (!owners.includes(walletAddress)) {
      throw new BadRequestException('Your account is not on the joint custody list.');
    }
    if (!lotReference) throw new BadRequestException('lotReference is required.');

    this.assertValidCapacities(dto.passport as any);
    const onchain = await this.loadOnchainPassport(owners, lotReference);
    if (!onchain) throw new BadRequestException('Lot on-chain passport was not found.');
    const chainStatus = String((onchain as any)?.status || '').trim().toUpperCase();
    if (chainStatus === 'CONSUMED') {
      throw new BadRequestException(
        'This lot is already marked fully consumed; updates and dispatch are not allowed.',
      );
    }

    const incoming = (await this.maybeAttachPlanRef((dto.passport || {}) as any)) as any;
    const merged: Record<string, string> = {};
    for (const [k, v] of Object.entries(onchain || {})) {
      merged[String(k)] = typeof v === 'string' ? String(v).trim() : String(v ?? '').trim();
    }
    for (const [k, v] of Object.entries(incoming)) {
      merged[String(k)] = String(v ?? '').trim();
    }

    // If the caller didn't provide an explicit status, treat this as a "data refresh".
    // This avoids keeping old ACTIVE/DISPATCHED metadata after producer updates.
    if (!String(incoming?.status ?? '').trim()) {
      merged.status = 'UPDATED';
    }
    const passport = buildProductPassport({ lotReference, passport: merged });
    if (!String(passport.location || '').trim()) {
      throw new BadRequestException(`Active checkpoint location is required for lot "${lotReference}".`);
    }

    const { policyId } = this.plutusHelper.getScripts(owners);
    const inventoryKey = policyId + CIP68_100(stringToHex(lotReference));
    const unsignedTx = await this.txBuilderHelper.buildUpdateTx(walletAddress, owners, [
      { productName: lotReference, metadata: passport },
    ]);
    return {
      result: true,
      data: unsignedTx,
      message: 'Lot passport refresh prepared.',
      traceSchemeRef: policyId,
      lotReference,
      inventoryKey,
    };
  }

  async createUnsignedDeleteTx(dto: ProductContractDeleteDto) {
    const walletAddress = String(dto.custodianAddress || '').trim();
    const owners = (dto.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const lotReference = String(dto.lotReference || '').trim();
    if (!walletAddress) throw new BadRequestException('custodianAddress is required.');
    if (owners.length === 0) throw new BadRequestException('owners is required.');
    if (!owners.includes(walletAddress)) {
      throw new BadRequestException('Your account is not on the joint custody list.');
    }
    if (!lotReference) throw new BadRequestException('lotReference is required.');

    const onchain = await this.loadOnchainPassport(owners, lotReference);
    const chainStatus = onchain ? String((onchain as any)?.status || '').trim().toUpperCase() : '';
    if (chainStatus === 'OUTBOUND_DISPATCH') {
      throw new BadRequestException(
        'This lot was already dispatched from warehouse; full closure is not allowed.',
      );
    }
    if (chainStatus === 'CONSUMED') {
      throw new BadRequestException(
        'This lot is already marked fully consumed; full closure is not allowed.',
      );
    }

    const { policyId } = this.plutusHelper.getScripts(owners);
    const inventoryKey = policyId + CIP68_100(stringToHex(lotReference));
    const unsignedTx = await this.txBuilderHelper.buildBurnTx(walletAddress, owners, [{ productName: lotReference }]);
    return {
      result: true,
      data: unsignedTx,
      message: 'Full lot closure prepared.',
      traceSchemeRef: policyId,
      lotReference,
      inventoryKey,
    };
  }
}

