import { Injectable, BadRequestException } from '@nestjs/common';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

interface BlockfrostError {
  status_code?: number;
  message?: string;
}

@Injectable()
export class BlockchainService {
  private blockfrost: BlockFrostAPI;
  private platformWallet: string;

  constructor() {
    const projectId = process.env.BLOCKFROST_API_KEY;
    if (!projectId) {
      console.warn(
        'BLOCKFROST_API_KEY not set - payment verification disabled',
      );
    }

    this.blockfrost = new BlockFrostAPI({
      projectId: projectId || 'dummy',
      network:
        process.env.NEXT_PUBLIC_APP_NETWORK === 'mainnet'
          ? 'mainnet'
          : 'preprod',
    });

    this.platformWallet = process.env.APP_WALLET_ADDRESS || '';
  }

  async verifyPayment(
    txHash: string,
    expectedAmount: number,
    maxRetries = 10,
    delayMs = 2000,
  ): Promise<{
    valid: boolean;
    message: string;
    confirmedAmount?: number;
  }> {
    if (!process.env.BLOCKFROST_API_KEY) {
      console.warn(
        'Skipping payment verification - BLOCKFROST_API_KEY not set',
      );
      return { valid: true, message: 'Verification skipped (dev mode)' };
    }

    if (!this.platformWallet) {
      throw new BadRequestException('Platform wallet not configured');
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const tx = await this.blockfrost.txs(txHash);
        if (!tx.block) {
          if (attempt < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }
          return { valid: false, message: 'Transaction not yet confirmed' };
        }
        const utxos = await this.blockfrost.txsUtxos(txHash);
        let receivedAmount = 0;
        for (const output of utxos.outputs) {
          if (output.address === this.platformWallet) {
            const lovelace = output.amount.find((a) => a.unit === 'lovelace');
            if (lovelace) {
              receivedAmount += parseInt(lovelace.quantity);
            }
          }
        }

        const receivedADA = receivedAmount / 1_000_000;
        if (receivedADA < expectedAmount) {
          return {
            valid: false,
            message: `Insufficient payment. Expected ${expectedAmount} ADA, received ${receivedADA} ADA`,
            confirmedAmount: receivedADA,
          };
        }

        return {
          valid: true,
          message: 'Payment verified successfully',
          confirmedAmount: receivedADA,
        };
      } catch (error: unknown) {
        const bfError = error as BlockfrostError;
        if (bfError.status_code === 404) {
          if (attempt < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }
          return { valid: false, message: 'Transaction not found' };
        }
        throw new BadRequestException(
          `Failed to verify transaction: ${bfError.message || 'Unknown error'}`,
        );
      }
    }

    return { valid: false, message: 'Transaction verification timeout' };
  }

  async getTransactionInfo(txHash: string) {
    if (!process.env.BLOCKFROST_API_KEY) {
      return null;
    }

    try {
      const tx = await this.blockfrost.txs(txHash);
      const utxos = await this.blockfrost.txsUtxos(txHash);
      return { tx, utxos };
    } catch {
      return null;
    }
  }

  async getAssetInfo(policyId: string, assetNameHex: string) {
    if (!process.env.BLOCKFROST_API_KEY) {
      return null;
    }

    try {
      const asset = `${policyId}${assetNameHex}`;
      const assetInfo = await this.blockfrost.assetsById(asset);
      return assetInfo;
    } catch (error: unknown) {
      const bfError = error as BlockfrostError;
      if (bfError.status_code === 404) {
        return null;
      }
      throw error;
    }
  }

  async getAssetHistory(policyId: string, assetNameHex: string) {
    if (!process.env.BLOCKFROST_API_KEY) {
      return [];
    }

    try {
      const asset = `${policyId}${assetNameHex}`;
      const history = await this.blockfrost.assetsHistory(asset);
      const historyWithDetails = await Promise.all(
        history.map(async (h) => {
          try {
            const tx = await this.blockfrost.txs(h.tx_hash);
            return {
              txHash: h.tx_hash,
              action: h.action,
              amount: h.amount,
              blockTime: tx.block_time,
              blockHeight: tx.block_height,
            };
          } catch {
            return {
              txHash: h.tx_hash,
              action: h.action,
              amount: h.amount,
            };
          }
        }),
      );

      return historyWithDetails;
    } catch (error: unknown) {
      const bfError = error as BlockfrostError;
      if (bfError.status_code === 404) {
        return [];
      }
      throw error;
    }
  }

  async getAssetMetadata(policyId: string, assetNameHex: string) {
    if (!process.env.BLOCKFROST_API_KEY) {
      return null;
    }

    try {
      const asset = `${policyId}${assetNameHex}`;
      const addresses = await this.blockfrost.assetsAddresses(asset);

      if (addresses.length === 0) {
        return null;
      }

      const refAssetNameHex = '000643b0' + assetNameHex.slice(8);
      const refAsset = `${policyId}${refAssetNameHex}`;

      try {
        const refAddresses = await this.blockfrost.assetsAddresses(refAsset);
        if (refAddresses.length > 0) {
          const utxos = await this.blockfrost.addressesUtxosAsset(
            refAddresses[0].address,
            refAsset,
          );
          if (utxos.length > 0 && utxos[0].inline_datum) {
            return {
              datum: utxos[0].inline_datum,
              address: refAddresses[0].address,
            };
          }
        }
      } catch {
      }

      return null;
    } catch (error: unknown) {
      const bfError = error as BlockfrostError;
      if (bfError.status_code === 404) {
        return null;
      }
      throw error;
    }
  }
}
