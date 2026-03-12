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
      const unsignedTx = await this.txBuilderHelper.buildMintTx(
        walletAddress,
        owners,
        assets,
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

  async createRetire222(
    walletAddress: string,
    owners: string[],
    assets: Array<{ assetName: string }>,
  ): Promise<ContractResponse<string | null>> {
    try {
      const unsignedTx = await this.txBuilderHelper.buildRetire222Tx(
        walletAddress,
        owners,
        assets,
      );

      return {
        result: true,
        data: unsignedTx,
        message: 'Retire transaction created',
      };
    } catch (error: any) {
      return {
        result: false,
        data: null,
        message: error.message || 'Failed to create retire transaction',
      };
    }
  }

  async submitTx(signedTx: string): Promise<ContractResponse<string | null>> {
    try {
      const raw = (signedTx ?? '').trim();
      const clean = raw.startsWith('0x') ? raw.slice(2) : raw;
      if (!clean) {
        throw new BadRequestException('signedTx is required.');
      }
      if (clean.length % 2 !== 0) {
        throw new BadRequestException(
          'signedTx must be a hex string (even length).',
        );
      }
      if (!/^[0-9a-fA-F]+$/.test(clean)) {
        throw new BadRequestException('signedTx must be a hex string.');
      }

      // Blockfrost submitTx in @meshsdk/core expects a CBOR tx hex string.
      // Ensure we pass a clean hex string (without 0x) here.
      const txHash = await this.blockfrostProvider.submitTx(clean);

      return {
        result: true,
        data: txHash,
        message: 'Transaction submitted successfully',
      };
    } catch (error: any) {
      const details =
        (typeof error?.message === 'string' && error.message) ||
        (typeof error === 'string' && error) ||
        (typeof error?.toString === 'function' && error.toString()) ||
        '';
      return {
        result: false,
        data: null,
        message: details || 'Failed to submit transaction',
      };
    }
  }

  /** Check if wallet holds the NFT (222 token) for given policyId + assetName. */
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
