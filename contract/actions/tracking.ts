"use server";

import { convertDatum } from "@/lib/utils";
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";

interface HistoryEntry {
  txHash: string;
  datetime: number;
  status: "Completed";
  action: "Mint" | "Burn" | "Transfer" | "Update" | "Unknown";
  metadata: Record<string, any>;
  fee: string;
}

export const getTracking = async ({ unit }: { unit: string }) => {
  const blockfrostApi = new BlockFrostAPI({
    projectId: process.env.BLOCKFROST_API_KEY || "",
  });

  const assetTxRefs = await blockfrostApi.assetsTransactions(unit);

  const histories: HistoryEntry[] = [];

  for (const { tx_hash } of assetTxRefs) {
    try {
      const txInfo = await blockfrostApi.txs(tx_hash);
      const utxos = await blockfrostApi.txsUtxos(tx_hash);

      let inputQty = 0;
      let outputQty = 0;

      const inputWithAsset = utxos.inputs.find((input) =>
        input.amount.some((a) => a.unit === unit),
      );
      if (inputWithAsset) {
        const amt = inputWithAsset.amount.find((a) => a.unit === unit);
        inputQty = Number(amt?.quantity || 0);
      }

      const outputWithAsset = utxos.outputs.find((output) =>
        output.amount.some((a) => a.unit === unit),
      );
      if (outputWithAsset) {
        const amt = outputWithAsset.amount.find((a) => a.unit === unit);
        outputQty = Number(amt?.quantity || 0);
      }

      let action: HistoryEntry["action"] = "Unknown";
      let quantityChange: number | undefined;
      if (inputQty === 0 && outputQty > 0) {
        action = "Mint";
        quantityChange = outputQty;
      } else if (outputQty === 0 && inputQty > 0) {
        action = "Burn";
        quantityChange = -inputQty;
      } else if (inputQty > 0 && outputQty > 0) {
        quantityChange = outputQty - inputQty;
        if (quantityChange === 0) {
          action = "Transfer";
        } else {
          action = "Update";
        }
      }

      let rawDatum: string | undefined;
      if (outputWithAsset?.inline_datum) {
        rawDatum = outputWithAsset.inline_datum;
      } else if (inputWithAsset?.inline_datum) {
        rawDatum = inputWithAsset.inline_datum;
      }

      let metadata: any = {};
      if (rawDatum) {
        try {
          metadata = convertDatum(rawDatum);
        } catch (err) {
          console.error(`Deserialize datum failed for tx ${tx_hash}:`, err);
        }
      }

      histories.push({
        txHash: tx_hash,
        datetime: txInfo.block_time,
        fee: txInfo.fees,
        status: "Completed",
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
    if (entry.action === "Mint") {
      break;
    }
  }

  if (
    filteredHistory.length === 0 ||
    !filteredHistory.some((e) => e.action === "Mint")
  ) {
    return {
      metadata: histories[0]?.metadata || {},
      transaction_history: histories,
      message: "Không tìm thấy Mint nào trong lịch sử.",
    };
  }

  const latestMetadata = histories[0]?.metadata || {};

  return {
    metadata: latestMetadata,
    transaction_history: filteredHistory,
  };
};
