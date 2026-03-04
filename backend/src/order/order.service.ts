import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import type { UTxO } from "@meshsdk/core";
import { EmbeddedWallet, cst } from "@meshsdk/core";
import { blockfrostProvider, blockfrostFetcher } from "../core/cardano/standalone";
import { CIP68_PREFIX } from "../core/config/config.service";
import { OrderContract } from "./order.contract";
import { ProductService } from "../product/product.service";
import {
  ORDER_REPOSITORY,
  OrderRecordParams,
  OrderRepositoryPort,
} from "./domain/order.repository";
import { ListOrdersForProfileUseCase } from "./application/use-cases/list-orders-for-profile.use-case";
import { SavePartialSignedTxUseCase } from "./application/use-cases/save-partial-signed-tx.use-case";
import { RecordOrderUseCase } from "./application/use-cases/record-order.use-case";
import { ConfirmOrderCompleteUseCase } from "./application/use-cases/confirm-order-complete.use-case";

const LABEL_222 = CIP68_PREFIX.USER_222;

function assetNameToHex(assetName: string): string {
  if (!assetName?.trim()) return "";
  const s = assetName.trim();
  if (s.toLowerCase().startsWith("hex:") && s.length > 4) return s.slice(4);
  return Buffer.from(s, "utf8").toString("hex");
}

@Injectable()
export class OrderService {
  private _contract: OrderContract | null = null;

  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepositoryPort,
    private readonly product: ProductService,
    private readonly listOrdersForProfileUseCase: ListOrdersForProfileUseCase,
    private readonly savePartialSignedTxUseCase: SavePartialSignedTxUseCase,
    private readonly recordOrderUseCase: RecordOrderUseCase,
    private readonly confirmOrderCompleteUseCase: ConfirmOrderCompleteUseCase
  ) {}

  getContract(): OrderContract {
    if (!this._contract) this._contract = new OrderContract();
    return this._contract;
  }

  getScriptAddress(): string {
    return this.getContract().getScriptAddress();
  }

  getScriptCbor(): string {
    return this.getContract().getScriptCbor();
  }

  async buildLockTx(params: {
    scriptAddress: string;
    ownersPkh: string[];
    threshold: number;
    recipientPkh: string;
    assets: { unit: string; quantity: string }[];
    changeAddress: string;
    utxos: UTxO[] | unknown[];
  }): Promise<string> {
    const utxos = params.utxos as UTxO[];
    return this.getContract().buildLockTx({
      ...params,
      utxos,
    });
  }

  async buildUnlockTx(params: {
    scriptUtxo: UTxO | unknown;
    outputAddress: string;
    signingOwnersPkh: string[];
    threshold: number;
    collateral: UTxO | unknown;
    changeAddress: string;
    utxos: UTxO[] | unknown[];
  }): Promise<string> {
    return this.getContract().buildUnlockTx({
      scriptUtxo: params.scriptUtxo as UTxO,
      outputAddress: params.outputAddress,
      signingOwnersPkh: params.signingOwnersPkh,
      threshold: params.threshold,
      collateral: params.collateral as UTxO,
      changeAddress: params.changeAddress,
      utxos: params.utxos as UTxO[],
    });
  }

  async parseDatumFromUtxo(utxo: UTxO | unknown): Promise<{
    ownersPkh: string[];
    threshold: number;
    recipientPkh: string;
    recipientAddress: string;
    ownerAddresses: string[];
  }> {
    const datum = await this.getContract().parseDatumFromUtxo(utxo as UTxO);
    const recipientAddress = this.getContract().getAddressFromPkh(datum.recipientPkh);
    const ownerAddresses = datum.ownersPkh.map((pkh) =>
      this.getContract().getAddressFromPkh(pkh)
    ).filter(Boolean);
    return { ...datum, recipientAddress, ownerAddresses };
  }

  async getScriptUtxos(scriptAddress?: string): Promise<UTxO[]> {
    const addr = scriptAddress ?? this.getScriptAddress();
    const utxos = await blockfrostProvider.fetchAddressUTxOs(addr);
    const blockByTx = new Map<string, number>();
    for (const u of utxos) {
      const txHash = u.input?.txHash;
      if (txHash && !blockByTx.has(txHash)) {
        try {
          const tx = await blockfrostFetcher.fetchSpecialTransaction(txHash) as { block_height?: number };
          blockByTx.set(txHash, tx?.block_height ?? 0);
        } catch {
          blockByTx.set(txHash, 0);
        }
      }
    }
    return [...utxos].sort((a, b) => {
      const blockA = blockByTx.get(a.input?.txHash ?? "") ?? 0;
      const blockB = blockByTx.get(b.input?.txHash ?? "") ?? 0;
      return blockB - blockA;
    });
  }

  async getScriptUtxoByAsset(
    policyId: string,
    assetName: string,
    scriptAddress?: string,
  ): Promise<UTxO | null> {
    const pid = policyId?.trim();
    const name = assetName?.trim();
    if (!pid || !name) return null;
    const hexName = assetNameToHex(name);
    const targetUnit = pid + LABEL_222 + hexName;
    const utxos = await this.getScriptUtxos(scriptAddress);
    return utxos.find((u) =>
      Array.isArray(u.output?.amount) &&
      u.output.amount.some((a: { unit?: string }) => a.unit === targetUnit),
    ) ?? null;
  }

  mergePartialTx(partialTxHex: string, secondSignerResultHex: string): { mergedTxHex: string; witnessCount: number; requiredSigners: string[] } {
    const partial = partialTxHex.trim().replace(/^0x/, "");
    const second = secondSignerResultHex.trim().replace(/^0x/, "");
    if (partial.length < 100) {
      throw new Error("partialTxHex is too short.");
    }

    let secondVkeysArray: Array<{ toCore: () => unknown }> = [];
    try {
      const txSecond = cst.deserializeTx(second);
      const vkeys = txSecond.witnessSet().vkeys();
      secondVkeysArray = vkeys ? Array.from(vkeys.values()) : [];
    } catch {
      throw new Error(
        "Could not parse result from owner 2 wallet (need full signed tx hex from wallet).",
      );
    }

    if (secondVkeysArray.length === 0) {
      throw new Error(
        "Owner 2 wallet did not return signatures. Ensure you are signed in with the second owner wallet (different from the wallet that signed step 1).",
      );
    }

    const txPartial = cst.deserializeTx(partial);
    const partialVkeys = txPartial.witnessSet().vkeys();
    const partialVkeysArray = partialVkeys ? Array.from(partialVkeys.values()) : [];

    const normalizeVkeyId = (raw: string): string => {
      const h = raw.toLowerCase().replace(/^0x/, "").replace(/^5820/, "");
      if (h.length === 64) return h;
      if (h.length === 56) return h;
      return raw;
    };

    const partialKeyIds = new Set<string>(
      partialVkeysArray.map((vkw) => {
        const core = (vkw as { toCore: () => [string, string] }).toCore();
        const id = Array.isArray(core) ? String(core[0]) : JSON.stringify(core);
        return normalizeVkeyId(id);
      }),
    );

    const newVkeysOnly = secondVkeysArray.filter((vkw) => {
      const core = (vkw as { toCore: () => [string, string] }).toCore();
      const id = Array.isArray(core) ? String(core[0]) : JSON.stringify(core);
      return !partialKeyIds.has(normalizeVkeyId(id));
    }) as Parameters<typeof EmbeddedWallet.addWitnessSets>[1];

    if (newVkeysOnly.length === 0 && partialVkeysArray.length < 2) {
      throw new Error(
        "No new signatures from owner 2 wallet. You must sign in with the second owner wallet (different from the signer of step 1).",
      );
    }

    let mergedHex: string;
    if (newVkeysOnly.length === 0) {
      mergedHex = partial;
    } else {
      mergedHex = EmbeddedWallet.addWitnessSets(partial, newVkeysOnly);
    }

    const txMerged = cst.deserializeTx(mergedHex);
    const mergedVkeys = txMerged.witnessSet().vkeys();
    const mergedVkeysArray = mergedVkeys ? Array.from(mergedVkeys.values()) : [];
    const witnessCount = mergedVkeysArray.length;

    const distinctKeyIds = new Set<string>(
      mergedVkeysArray.map((vkw) => {
        const core = (vkw as { toCore: () => [string, string] }).toCore();
        const id = Array.isArray(core) ? String(core[0]) : JSON.stringify(core);
        return normalizeVkeyId(id);
      }),
    );
    const distinctSignerCount = distinctKeyIds.size;

    if (witnessCount < 2) {
      throw new Error(
        `After merge the transaction has only ${witnessCount} signature(s); at least 2 required for 2-of-2.`,
      );
    }
    if (distinctSignerCount < 2) {
      throw new Error(
        "Transaction has 2 witnesses but from only 1 wallet. Use a different wallet for step 2.",
      );
    }

    const { requiredSigners } = this.inspectTx(mergedHex);
    return { mergedTxHex: mergedHex, witnessCount, requiredSigners };
  }

  inspectTx(txHex: string): { requiredSigners: string[]; witnessCount: number } {
    const hex = txHex.trim().replace(/^0x/, "");
    if (hex.length < 100) {
      throw new Error("txHex is too short.");
    }
    let tx: ReturnType<typeof cst.deserializeTx>;
    try {
      tx = cst.deserializeTx(hex);
    } catch {
      throw new Error("Could not parse tx hex.");
    }
    const body = tx.body();
    const req = body.requiredSigners();
    const requiredSigners: string[] = req
      ? req.values().map((h: { toCore: () => string }) => h.toCore())
      : [];
    const vkeys = tx.witnessSet().vkeys();
    const witnessCount = vkeys ? vkeys.size() : 0;
    return { requiredSigners, witnessCount };
  }

  async listOrdersForProfile(profileId: number): Promise<{
    id: number;
    lockTxHash: string;
    scriptOutputIndex: number;
    batchId: string;
    policyId: string | null;
    recipientAddress: string;
    senderAddress: string;
    ownerAddresses: string[];
    status: string;
    partialSignedTxHex: string | null;
    partialSignedByAddress: string | null;
    secondSignedByAddress: string | null;
    unlockTxHash: string | null;
    outAt: Date | null;
  }[]> {
    return this.listOrdersForProfileUseCase.execute(profileId);
  }

  async savePartialSignedTx(
    deliveryId: number,
    profileId: number,
    partialTxHex: string,
  ): Promise<{ ok: boolean }> {
    return this.savePartialSignedTxUseCase.execute(
      deliveryId,
      profileId,
      partialTxHex
    );
  }

  async recordOrder(params: {
    lockTxHash: string;
    scriptOutputIndex?: number;
    batchId: string;
    policyId?: string;
    recipientAddress: string;
    senderAddress: string;
    ownerAddresses: string[];
    scriptAddress?: string;
    datumHash?: string;
    datumJson?: unknown;
  }): Promise<{ id: number }> {
    const recordParams: OrderRecordParams = {
      lockTxHash: params.lockTxHash,
      scriptOutputIndex: params.scriptOutputIndex,
      batchId: params.batchId,
      policyId: params.policyId,
      scriptAddress: params.scriptAddress,
      datumHash: params.datumHash,
      datumJson: params.datumJson,
      recipientAddress: params.recipientAddress,
      senderAddress: params.senderAddress,
      ownerAddresses: params.ownerAddresses,
    };
    return this.recordOrderUseCase.execute(recordParams);
  }

  async confirmOrderComplete(params: {
    unlockTxHash: string;
    witnessCount: number;
    signedByAddress?: string;
    deliveryId?: number;
  }): Promise<{ ok: boolean; recipientAddress?: string }> {
    return this.confirmOrderCompleteUseCase.execute(params);
  }
}
