import { Injectable, BadRequestException } from '@nestjs/common';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

@Injectable()
export class BlockchainService {
  private blockfrost: BlockFrostAPI;
  private platformWallet: string;

  constructor() {
    const projectId = process.env.BLOCKFROST_API_KEY;
    if (!projectId) {
      console.warn('BLOCKFROST_API_KEY not set - payment verification disabled');
    }

    this.blockfrost = new BlockFrostAPI({
      projectId: projectId || 'dummy',
      network: process.env.NEXT_PUBLIC_APP_NETWORK === 'mainnet' ? 'mainnet' : 'preprod',
    });

    this.platformWallet = process.env.APP_WALLET_ADDRESS || '';
  }

  async verifyPayment(txHash: string, expectedAmount: number): Promise<{
    valid: boolean;
    message: string;
    confirmedAmount?: number;
  }> {
    if (!process.env.BLOCKFROST_API_KEY) {
      console.warn('Skipping payment verification - BLOCKFROST_API_KEY not set');
      return { valid: true, message: 'Verification skipped (dev mode)' };
    }

    if (!this.platformWallet) {
      throw new BadRequestException('Platform wallet not configured');
    }

    try {
      const tx = await this.blockfrost.txs(txHash);
      if (!tx.block) {
        return { valid: false, message: 'Transaction not yet confirmed' };
      }
      const utxos = await this.blockfrost.txsUtxos(txHash);
      let receivedAmount = 0;
      for (const output of utxos.outputs) {
        if (output.address === this.platformWallet) {
          const lovelace = output.amount.find(a => a.unit === 'lovelace');
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
    } catch (error: any) {
      if (error.status_code === 404) {
        return { valid: false, message: 'Transaction not found' };
      }
      throw new BadRequestException(`Failed to verify transaction: ${error.message}`);
    }
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
}
