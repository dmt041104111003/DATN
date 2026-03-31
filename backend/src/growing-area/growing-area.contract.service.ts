import { Injectable, BadRequestException } from '@nestjs/common';
import { CIP68_100, CIP68_222, stringToHex } from '@meshsdk/core';
import { BlockfrostProvider } from '@meshsdk/core';
import { PrismaService } from '../prisma/prisma.service';
import { PlutusHelper } from './helpers/plutus.helper';
import { TxBuilderHelper } from './helpers/tx-builder.helper';
import { buildGrowingAreaPassport } from './growing-area.contract.helper';

@Injectable()
export class GrowingAreaContractService {
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

  private generateAssetName(prefix: 'AREA'): string {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    const time = Date.now().toString(36).slice(-8).toUpperCase();
    return `${prefix}-${time}-${rand}`;
  }

  async getInfo(owners: string[]) {
    const custodyParties = (owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    try {
      const { policyId, contractAddress } = this.plutusHelper.getScripts(custodyParties);
      return { schemeReference: policyId, custodyVaultAddress: contractAddress };
    } catch (error: any) {
      throw new BadRequestException(
        `Unable to resolve custody configuration: ${error.message}`,
      );
    }
  }

  async createUnsignedCreateTx(input: {
    custodianAddress: string;
    owners: string[];
    assetName?: string;
    name: string;
    location: string;
    areaSize?: string;
    soilType?: string;
    nftImageIpfs?: string | null;
  }) {
    const signer = (input.custodianAddress || '').trim();
    const owners = (input.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const assetName = (input.assetName || '').trim() || this.generateAssetName('AREA');
    const name = (input.name || '').trim();
    const location = (input.location || '').trim();
    const nftImageIpfs = input.nftImageIpfs ? String(input.nftImageIpfs || '').trim() : '';

    if (!signer) throw new BadRequestException('custodianAddress is required.');
    if (owners.length === 0) throw new BadRequestException('owners is required.');
    if (!name) throw new BadRequestException('name is required.');
    if (!location) throw new BadRequestException('location is required.');
    if (!owners.includes(signer)) {
      throw new BadRequestException(
        'The signing custodian must appear on the joint custody list to register new areas.',
      );
    }

    const passport = buildGrowingAreaPassport({
      assetName,
      name,
      location,
      areaSize: input.areaSize,
      soilType: input.soilType,
      owners,
      nftImageIpfs,
    });

    const unsignedTx = await this.txBuilderHelper.buildMintTx(
      signer,
      owners,
      [
        {
          productName: assetName,
          metadata: passport,
          quantity: '1',
        },
      ],
    );

    const { policyId } = this.plutusHelper.getScripts(owners);
    const inventoryKey = policyId + CIP68_100(stringToHex(assetName));
    return {
      result: true,
      data: unsignedTx,
      message: 'Area mint record prepared.',
      assetName,
      traceSchemeRef: policyId,
      inventoryKey,
    };
  }

  async createUnsignedDeleteTx(input: {
    custodianAddress: string;
    owners: string[];
    inventoryKey: string;
  }) {
    const walletAddress = (input.custodianAddress || '').trim();
    const owners = (input.owners || []).map((s) => String(s || '').trim()).filter(Boolean);
    const inventoryKey = (input.inventoryKey || '').trim();
    if (!walletAddress) throw new BadRequestException('custodianAddress is required.');
    if (owners.length === 0) throw new BadRequestException('owners is required.');
    if (!inventoryKey) throw new BadRequestException('inventoryKey is required.');
    if (!owners.includes(walletAddress)) {
      throw new BadRequestException(
        'Your account is not on the joint custody list; cannot close the area.',
      );
    }

    const planCount = await (this.prisma as any).plan.count({
      where: { growingAreaInventoryKey: inventoryKey },
    });
    if (planCount > 0) {
      throw new BadRequestException(
        'Cannot retire this growing area because it still has plans attached.',
      );
    }

    const { policyId } = this.plutusHelper.getScripts(owners);
    const policy = inventoryKey.slice(0, policyId.length);
    const rest = inventoryKey.slice(policyId.length);
    const hexName = rest.startsWith(CIP68_222('')) ? rest.slice(CIP68_222('').length) : rest;
    const nameBytes = hexName.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || [];
    const assetName = new TextDecoder().decode(new Uint8Array(nameBytes));
    if (!assetName) throw new BadRequestException('Unable to decode asset name from inventoryKey.');

    const holds = await this.txBuilderHelper.getAddressUTXOAssets(
      walletAddress,
      policy + CIP68_222(stringToHex(assetName)),
    );
    if (!holds || holds.length === 0) {
      throw new BadRequestException(
        'This custodian is not carrying the movement credential for this area.',
      );
    }

    const unsignedTx = await this.txBuilderHelper.buildBurnTx(
      walletAddress,
      owners,
      [{ productName: assetName }],
    );

    return {
      result: true,
      data: unsignedTx,
      message: 'Area close record prepared.',
    };
  }
}

