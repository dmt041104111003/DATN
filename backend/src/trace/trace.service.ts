import { Injectable } from '@nestjs/common';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { deserializeDatum } from '../utils/deserialize-datum';
import { CIP68_222, stringToHex } from '@meshsdk/core';

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

  async getProductTrace(unit: string): Promise<TraceResult> {
    let burned = false;
    try {
      const assetInfo = await this.blockfrost.assetsById(unit);
      burned = assetInfo.quantity === '0';
    } catch {
      burned = true;
    }

    if (burned) {
      return {
        metadata: {},
        transaction_history: [],
        burned: true,
        message: 'This product has been burned and no longer exists on-chain.',
      };
    }

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
        message: 'Không tìm thấy Mint nào trong lịch sử.',
      };
    }

    const latestMetadata = (histories[0]?.metadata as Record<string, unknown>) || {};

    // FULL ON-CHAIN: Retire is burning CIP-68 user token (222) only, which won't show up in ref100 history.
    // We derive the 222 unit from the ref100 unit and inspect its on-chain state.
    try {
      const policyId = unit.slice(0, 56);
      const rest = unit.slice(56);
      const REF_PREFIX = '000643b0'; // CIP-68 ref token prefix
      let hexName = rest;
      if (hexName.startsWith(REF_PREFIX)) {
        hexName = hexName.slice(REF_PREFIX.length);
      }
      const assetName =
        hexName && hexName.length % 2 === 0
          ? Buffer.from(hexName, 'hex').toString('utf8')
          : '';

      if (policyId && assetName) {
        const userUnit = policyId + CIP68_222(stringToHex(assetName));

        let userBurned = false;
        try {
          const userInfo = await this.blockfrost.assetsById(userUnit);
          userBurned = userInfo.quantity === '0';
        } catch {
          userBurned = true;
        }

        if (userBurned) {
          const userTxRefs = await this.blockfrost.assetsTransactions(userUnit);
          let burnTxHash = userTxRefs?.[0]?.tx_hash as string | undefined;
          let burnTime = 0;
          let burnFee = '';

          // Try to locate the actual burn tx by inspecting I/O quantities of 222
          for (const { tx_hash } of userTxRefs || []) {
            try {
              const txInfo = await this.blockfrost.txs(tx_hash);
              const utxos = await this.blockfrost.txsUtxos(tx_hash);
              let inputQty = 0;
              let outputQty = 0;

              const inputWithAsset = utxos.inputs.find((input: any) =>
                input.amount?.some((a: any) => a.unit === userUnit),
              );
              if (inputWithAsset) {
                const amt = inputWithAsset.amount.find((a: any) => a.unit === userUnit);
                inputQty = Number(amt?.quantity || 0);
              }

              const outputWithAsset = utxos.outputs.find((output: any) =>
                output.amount?.some((a: any) => a.unit === userUnit),
              );
              if (outputWithAsset) {
                const amt = outputWithAsset.amount.find((a: any) => a.unit === userUnit);
                outputQty = Number(amt?.quantity || 0);
              }

              if (inputQty > 0 && outputQty === 0) {
                burnTxHash = tx_hash;
                burnTime = txInfo.block_time || 0;
                burnFee = txInfo.fees || '';
                break;
              }
            } catch {
              // ignore, fallback to first tx hash
            }
          }

          filteredHistory.unshift({
            txHash: burnTxHash || 'retired',
            datetime: burnTime || histories[0]?.datetime || 0,
            fee: burnFee || '',
            status: 'Completed',
            action: 'Burn',
            metadata: {
              location:
                (latestMetadata?.location as string | undefined) ||
                (histories[0]?.metadata as any)?.location ||
                '',
              status: 'Retired222',
            },
          });
        }
      }
    } catch {
      // ignore retire enrichment
    }

    return {
      metadata: latestMetadata,
      transaction_history: filteredHistory,
      burned: false,
    };
  }
}
