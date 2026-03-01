import { Injectable, BadRequestException } from "@nestjs/common";
import type { UTxO } from "@meshsdk/core";
import { EmbeddedWallet, cst } from "@meshsdk/core";
import { Prisma } from "@prisma/client";
import { blockfrostProvider, blockfrostFetcher } from "../cardano/standalone";
import { CIP68_PREFIX } from "../config/config.service";
import { MultisigContract } from "./multisig.contract";
import { PrismaService } from "../prisma/prisma.service";
import { TraceService } from "../trace/trace.service";

const LABEL_222 = CIP68_PREFIX.USER_222;
const LOCK_DELIVERY_STATUS = { IN_DELIVERY: "IN_DELIVERY", DELIVERED: "DELIVERED" } as const;

function assetNameToHex(assetName: string): string {
  if (!assetName?.trim()) return "";
  const s = assetName.trim();
  if (s.toLowerCase().startsWith("hex:") && s.length > 4) return s.slice(4);
  return Buffer.from(s, "utf8").toString("hex");
}

@Injectable()
export class MultisigService {
  private _contract: MultisigContract | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly trace: TraceService,
  ) {}

  getContract(): MultisigContract {
    if (!this._contract) this._contract = new MultisigContract();
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
        `After merge the transaction has only ${witnessCount} signature(s); at least 2 required for 2-of-2. Ensure you pasted the correct partial tx from owner 1 and are signed in with the second owner wallet (different wallet).`,
      );
    }
    if (distinctSignerCount < 2) {
      throw new Error(
        "Transaction has 2 witnesses but from only 1 wallet (1 signer). You are using the same wallet for both step 1 and step 2. Sign out, connect Owner 2 wallet (different from the step 1 signer), then paste the partial tx again and click Sign & Submit.",
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

  async listLockDeliveriesForProfile(profileId: number): Promise<{
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
  }[]> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { walletAddress: true },
    });
    if (!profile?.walletAddress?.trim()) {
      return [];
    }
    const wallet = profile.walletAddress.trim().toLowerCase();
    const rows = await this.prisma.multisigLockDelivery.findMany({
      where: {
        status: LOCK_DELIVERY_STATUS.IN_DELIVERY,
        NOT: { senderAddress: profile.walletAddress.trim() },
      },
      orderBy: { createdAt: "desc" },
    });
    return rows
      .filter((row: { ownerAddresses: unknown }) => {
        const owners = Array.isArray(row.ownerAddresses) ? (row.ownerAddresses as string[]) : [];
        return owners.some((addr: string) => (addr || "").trim().toLowerCase() === wallet);
      })
      .map((row: Record<string, unknown>) => {
        const r = row as { id: number; lockTxHash: string; scriptOutputIndex: number; batchId: string; policyId: string | null; recipientAddress: string; senderAddress: string; ownerAddresses: unknown; status: string; partialSignedTxHex?: string | null; partialSignedByAddress?: string | null; secondSignedByAddress?: string | null; unlockTxHash?: string | null };
        return {
          id: r.id,
          lockTxHash: r.lockTxHash,
          scriptOutputIndex: r.scriptOutputIndex,
          batchId: r.batchId,
          policyId: r.policyId,
          recipientAddress: r.recipientAddress,
          senderAddress: r.senderAddress,
          ownerAddresses: Array.isArray(r.ownerAddresses) ? (r.ownerAddresses as string[]) : [],
          status: r.status,
          partialSignedTxHex: r.partialSignedTxHex ?? null,
          partialSignedByAddress: r.partialSignedByAddress ?? null,
          secondSignedByAddress: r.secondSignedByAddress ?? null,
          unlockTxHash: r.unlockTxHash ?? null,
        };
      });
  }

  async savePartialSignedTx(
    deliveryId: number,
    profileId: number,
    partialTxHex: string,
  ): Promise<{ ok: boolean }> {
    const hex = (partialTxHex || "").trim().replace(/^0x/, "");
    if (hex.length < 100) {
      throw new BadRequestException("partialTxHex is too short.");
    }
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { walletAddress: true },
    });
    if (!profile?.walletAddress?.trim()) {
      throw new BadRequestException("Profile or wallet not found.");
    }
    const wallet = profile.walletAddress.trim().toLowerCase();
    const delivery = await this.prisma.multisigLockDelivery.findUnique({
      where: { id: deliveryId },
    });
    if (!delivery || delivery.status !== LOCK_DELIVERY_STATUS.IN_DELIVERY) {
      throw new BadRequestException("Delivery not found or not IN_DELIVERY.");
    }
    const owners = Array.isArray(delivery.ownerAddresses) ? (delivery.ownerAddresses as string[]) : [];
    const isOwner = owners.some((addr: string) => (addr || "").trim().toLowerCase() === wallet);
    if (!isOwner) {
      throw new BadRequestException("You are not an owner of this delivery.");
    }
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE "MultisigLockDelivery" SET "partialSignedTxHex" = ${hex}, "partialSignedByAddress" = ${profile.walletAddress.trim()} WHERE id = ${deliveryId}`,
    );
    return { ok: true };
  }

  async recordLockDelivery(params: {
    lockTxHash: string;
    scriptOutputIndex?: number;
    batchId: string;
    policyId?: string;
    recipientAddress: string;
    senderAddress: string;
    ownerAddresses: string[];
  }): Promise<{ id: number }> {
    const scriptOutputIndex = params.scriptOutputIndex ?? 0;
    const ownerAddresses = Array.isArray(params.ownerAddresses) ? params.ownerAddresses : [];
    const delivery = await this.prisma.multisigLockDelivery.upsert({
      where: {
        lockTxHash_scriptOutputIndex: {
          lockTxHash: params.lockTxHash.trim(),
          scriptOutputIndex,
        },
      },
      create: {
        lockTxHash: params.lockTxHash.trim(),
        scriptOutputIndex,
        batchId: params.batchId.trim(),
        policyId: params.policyId?.trim() ?? null,
        recipientAddress: params.recipientAddress.trim(),
        senderAddress: params.senderAddress.trim(),
        ownerAddresses,
        status: LOCK_DELIVERY_STATUS.IN_DELIVERY,
      },
      update: {},
    });
    return { id: delivery.id };
  }

  async confirmUnlockDelivery(params: {
    unlockTxHash: string;
    witnessCount: number;
    signedByAddress?: string;
    deliveryId?: number;
  }): Promise<{ ok: boolean; recipientAddress?: string }> {
    const { unlockTxHash, witnessCount, signedByAddress, deliveryId } = params;
    if (witnessCount < 2) {
      throw new BadRequestException(
        "Unlock requires at least 2 signatures (witnessCount >= 2).",
      );
    }
    let delivery: { id: number; batchId: string; recipientAddress: string; status: string } | null = null;

    if (deliveryId != null && Number.isInteger(deliveryId) && deliveryId > 0) {
      const found = await this.prisma.multisigLockDelivery.findUnique({
        where: { id: deliveryId },
      });
      if (found && found.status === LOCK_DELIVERY_STATUS.IN_DELIVERY) {
        delivery = { id: found.id, batchId: found.batchId, recipientAddress: found.recipientAddress, status: found.status };
      }
    }

    if (!delivery) {
      const tx = await blockfrostFetcher.fetchTransactionsUTxO(unlockTxHash.trim());
      const inputs = tx?.inputs ?? [];
      for (const inp of inputs) {
        const lockTxHash = inp.tx_hash;
        const scriptOutputIndex = inp.output_index ?? 0;
        const found = await this.prisma.multisigLockDelivery.findUnique({
          where: {
            lockTxHash_scriptOutputIndex: { lockTxHash, scriptOutputIndex },
          },
        });
        if (found && found.status === LOCK_DELIVERY_STATUS.IN_DELIVERY) {
          delivery = { id: found.id, batchId: found.batchId, recipientAddress: found.recipientAddress, status: found.status };
          break;
        }
      }
    }

    if (!delivery) {
      throw new BadRequestException(
        "No matching lock delivery (IN_DELIVERY) found for this unlock tx. Ensure lock was confirmed first, or pass deliveryId.",
      );
    }
    const secondAddr = (signedByAddress || "").trim() || null;
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE "MultisigLockDelivery" SET status = 'DELIVERED', "unlockTxHash" = ${unlockTxHash.trim()}, "secondSignedByAddress" = ${secondAddr} WHERE id = ${delivery.id}`,
    );
    const recipientAddress = delivery.recipientAddress.trim().toLowerCase();
    const profile = await this.prisma.profile.findFirst({
      where: {
        walletAddress: delivery.recipientAddress.trim(),
        role: { code: { in: ["TRANSIT", "AGENT"] } },
      },
      select: { id: true },
    });
    if (profile) {
      await this.trace.addToWarehouse(profile.id, delivery.batchId);
    }
    return { ok: true, recipientAddress: delivery.recipientAddress };
  }
}
