import { Injectable, BadRequestException } from '@nestjs/common';
import { CIP68_222, stringToHex } from '@meshsdk/core';
import { BlockfrostProvider } from '@meshsdk/core';
import { PlutusHelper } from './helpers/plutus.helper';
import { TxBuilderHelper } from './helpers/tx-builder.helper';

export interface ContractResponse<T = string | null> {
  result: boolean;
  data: T;
  message: string;
}

@Injectable()
export class ContractService {
  private blockfrostProvider: BlockfrostProvider;
  private plutusHelper: PlutusHelper;
  private txBuilderHelper: TxBuilderHelper;

  constructor() {
    const apiKey = process.env.BLOCKFROST_API_KEY;

    if (!apiKey) {
      throw new Error('BLOCKFROST_API_KEY is not set');
    }

    this.blockfrostProvider = new BlockfrostProvider(apiKey);
    this.plutusHelper = new PlutusHelper();
    this.txBuilderHelper = new TxBuilderHelper(
      this.blockfrostProvider,
      this.plutusHelper,
    );
  }

  async getInfo(owners: string[]): Promise<{ policyId: string; contractAddress: string }> {
    try {
      const { policyId, contractAddress } = this.plutusHelper.getScripts(owners);
      return { policyId, contractAddress };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to get contract info: ${error.message}`,
      );
    }
  }

  async createMint(
    walletAddress: string,
    owners: string[],
    assets: Array<{
      assetName: string;
      metadata: Record<string, string>;
      quantity?: string;
      receiver?: string;
    }>,
  ): Promise<ContractResponse<string | null>> {
    try {
      const signer = (walletAddress || '').trim();
      const normalizedOwners = (owners || []).map((o) => (o || '').trim()).filter(Boolean);
      if (!signer) {
        throw new Error('walletAddress is required');
      }
      if (normalizedOwners.length === 0) {
        throw new Error('At least one owner is required');
      }
      if (!normalizedOwners.includes(signer)) {
        throw new Error('Your wallet is not in script owners list. Cannot mint.');
      }
      if (!Array.isArray(assets) || assets.length === 0) {
        throw new Error('At least one asset is required');
      }

      const normalizedAssets = assets.map((a) => ({
        assetName: (a.assetName || '').trim(),
        quantity: '1',
        metadata: a.metadata || {},
        receiver: (a.receiver || '').trim() || undefined,
      }));
      if (normalizedAssets.some((a) => !a.assetName)) {
        throw new Error('assetName is required for all assets');
      }
      const nameSet = new Set(normalizedAssets.map((a) => a.assetName));
      if (nameSet.size !== normalizedAssets.length) {
        throw new Error('Duplicate assetName in mint request');
      }

      const unsignedTx = await this.txBuilderHelper.buildMintTx(
        signer,
        normalizedOwners,
        normalizedAssets,
      );

      return {
        result: true,
        data: unsignedTx,
        message: 'Mint transaction created',
      };
    } catch (error: any) {
      return {
        result: false,
        data: null,
        message: error.message || 'Failed to create mint transaction',
      };
    }
  }

  async createUpdate(
    walletAddress: string,
    owners: string[],
    assets: Array<{ assetName: string; metadata: Record<string, string> }>,
  ): Promise<ContractResponse<string | null>> {
    try {
      if (!owners.includes(walletAddress)) {
        throw new Error('Your wallet is not in script owners list. Cannot update.');
      }

      const { policyId } = this.plutusHelper.getScripts(owners);
      for (const { assetName, metadata } of assets) {
        if (typeof metadata?.location !== 'string' || metadata.location.trim().length === 0) {
          throw new Error(`metadata.location is required for "${assetName}"`);
        }
        const hasNft = await this.checkWalletHasNft(walletAddress, policyId, assetName);
        if (!hasNft) {
          throw new Error(`Wallet does not hold NFT "${assetName}"`);
        }
      }

      const unsignedTx = await this.txBuilderHelper.buildUpdateTx(
        walletAddress,
        owners,
        assets,
      );

      return {
        result: true,
        data: unsignedTx,
        message: 'Update transaction created',
      };
    } catch (error: any) {
      return {
        result: false,
        data: null,
        message: error.message || 'Failed to create update transaction',
      };
    }
  }

  async createBurn(
    walletAddress: string,
    owners: string[],
    assets: Array<{ assetName: string }>,
  ): Promise<ContractResponse<string | null>> {
    try {
      if (!owners.includes(walletAddress)) {
        throw new Error('Your wallet is not in script owners list. Cannot burn.');
      }

      const { policyId } = this.plutusHelper.getScripts(owners);
      for (const { assetName } of assets) {
        const hasNft = await this.checkWalletHasNft(
          walletAddress,
          policyId,
          assetName,
        );
        if (!hasNft) {
          throw new Error(`Wallet does not hold NFT "${assetName}"`);
        }
      }

      const unsignedTx = await this.txBuilderHelper.buildBurnTx(
        walletAddress,
        owners,
        assets,
      );

      return {
        result: true,
        data: unsignedTx,
        message: 'Burn transaction created',
      };
    } catch (error: any) {
      return {
        result: false,
        data: null,
        message: error.message || 'Failed to create burn transaction',
      };
    }
  }

  async createBurn222(
    walletAddress: string,
    owners: string[],
    assets: Array<{ assetName: string }>,
  ): Promise<ContractResponse<string | null>> {
    try {
      if (!owners.includes(walletAddress)) {
        throw new Error('Your wallet is not in script owners list. Cannot burn token 222.');
      }

      const { policyId } = this.plutusHelper.getScripts(owners);
      for (const { assetName } of assets) {
        const hasNft = await this.checkWalletHasNft(
          walletAddress,
          policyId,
          assetName,
        );
        if (!hasNft) {
          throw new Error(`Wallet does not hold NFT "${assetName}"`);
        }
      }

      const unsignedTx = await this.txBuilderHelper.buildBurn222Tx(
        walletAddress,
        owners,
        assets,
      );

      return {
        result: true,
        data: unsignedTx,
        message: 'Burn token 222 transaction created',
      };
    } catch (error: any) {
      return {
        result: false,
        data: null,
        message: error.message || 'Failed to create burn token 222 transaction',
      };
    }
  }

  async submitTx(signedTx: string): Promise<ContractResponse<string | null>> {
    try {
      const txHash = await this.blockfrostProvider.submitTx(signedTx);

      return {
        result: true,
        data: txHash,
        message: 'Transaction submitted successfully',
      };
    } catch (error: any) {
      return {
        result: false,
        data: null,
        message: error.message || 'Failed to submit transaction',
      };
    }
  }

  async checkWalletHasNft(
    walletAddress: string,
    policyId: string,
    assetName: string,
  ): Promise<boolean> {
    const userUnit = policyId + CIP68_222(stringToHex(assetName));
    const utxos = await this.txBuilderHelper.getAddressUTXOAssets(
      walletAddress,
      userUnit,
    );
    return utxos.length > 0;
  }

  async createTransfer(
    walletAddress: string,
    receiver: string,
    policyId: string,
    assetName: string,
    quantity: string = '1',
  ): Promise<ContractResponse<string | null>> {
    try {
      const unsignedTx = await this.txBuilderHelper.buildTransferTx(
        walletAddress,
        receiver,
        policyId,
        assetName,
        quantity,
      );

      return {
        result: true,
        data: unsignedTx,
        message: 'Transfer transaction created',
      };
    } catch (error: any) {
      return {
        result: false,
        data: null,
        message: error.message || 'Failed to create transfer transaction',
      };
    }
  }
}
