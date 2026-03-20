import { Injectable } from '@nestjs/common';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { deserializeDatum } from '../utils/deserialize-datum';

export interface HistoryEntry {
  txHash: string;
  datetime: number;
  status: 'Completed';
  action: 'Mint' | 'Burn' | 'Transfer' | 'Update' | 'Unknown';
  metadata: Record<string, unknown>;
  fee: string;
}

export interface TraceResult {
  metadata: Record<string, unknown>;
  transaction_history: HistoryEntry[];
  burned: boolean;
  message?: string;
}

@Injectable()
export class TraceService {
  private blockfrost: BlockFrostAPI;

  constructor() {
    const projectId = process.env.BLOCKFROST_API_KEY || '';
    if (!projectId) {
      throw new Error('BLOCKFROST_API_KEY is not set');
    }
    this.blockfrost = new BlockFrostAPI({
      projectId,
      network: 'preprod',
    });
  }

  private async getProductTraceInternal(unit: string): Promise<TraceResult> {
    const assetTxRefs = await this.blockfrost.assetsTransactions(unit);
    const histories: HistoryEntry[] = [];

    for (const { tx_hash } of assetTxRefs) {
      try {
        const txInfo = await this.blockfrost.txs(tx_hash);
        const utxos = await this.blockfrost.txsUtxos(tx_hash);

        let inputQty = 0;
        let outputQty = 0;

        const inputWithAsset = utxos.inputs.find((input: { amount: { unit: string; quantity: string }[] }) =>
          input.amount.some((a) => a.unit === unit),
        );
        if (inputWithAsset) {
          const amt = inputWithAsset.amount.find((a) => a.unit === unit);
          inputQty = Number(amt?.quantity || 0);
        }

        const outputWithAsset = utxos.outputs.find((output: { amount: { unit: string; quantity: string }[] }) =>
          output.amount.some((a) => a.unit === unit),
        );
        if (outputWithAsset) {
          const amt = outputWithAsset.amount.find((a) => a.unit === unit);
          outputQty = Number(amt?.quantity || 0);
        }

        let action: HistoryEntry['action'] = 'Unknown';
        if (inputQty === 0 && outputQty > 0) {
          action = 'Mint';
        } else if (outputQty === 0 && inputQty > 0) {
          action = 'Burn';
        } else if (inputQty > 0 && outputQty > 0) {
          const quantityChange = outputQty - inputQty;
          action = quantityChange === 0 ? 'Transfer' : 'Update';
        }

        let rawDatum: string | undefined;
        const outWithDatum = outputWithAsset as { inline_datum?: string } | undefined;
        const inWithDatum = inputWithAsset as { inline_datum?: string } | undefined;
        if (outWithDatum?.inline_datum) {
          rawDatum = outWithDatum.inline_datum;
        } else if (inWithDatum?.inline_datum) {
          rawDatum = inWithDatum.inline_datum;
        }

        let metadata: Record<string, unknown> = {};
        if (rawDatum) {
          try {
            metadata = await deserializeDatum(rawDatum);
          } catch (err) {
            console.error(`Deserialize datum failed for tx ${tx_hash}:`, err);
          }
        }

        histories.push({
          txHash: tx_hash,
          datetime: txInfo.block_time,
          fee: txInfo.fees,
          status: 'Completed',
          action,
          metadata,
        });
      } catch (err) {
        console.error(`Error processing tx ${tx_hash}:`, err);
      }
    }

    histories.sort((a, b) => b.datetime - a.datetime);

    const filteredHistory: HistoryEntry[] = [];
    for (const entry of histories) {
      filteredHistory.push(entry);
      if (entry.action === 'Mint') {
        break;
      }
    }

    if (
      filteredHistory.length === 0 ||
      !filteredHistory.some((e) => e.action === 'Mint')
    ) {
      return {
        metadata: (histories[0]?.metadata as Record<string, unknown>) || {},
        transaction_history: histories,
        burned: false,
        message: 'Mint not found in transaction history.',
      };
    }

    const latestMetadata = (histories[0]?.metadata as Record<string, unknown>) || {};

    return {
      metadata: latestMetadata,
      transaction_history: filteredHistory,
      burned: histories.length > 0 && histories[0].action === 'Burn',
    };
  }

  async getProductTrace(unit: string): Promise<TraceResult> {
    return this.getProductTraceInternal(unit);
  }
}
