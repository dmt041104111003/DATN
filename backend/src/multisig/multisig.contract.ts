import type { UTxO } from "@meshsdk/core";
import { MeshTxBuilder, resolvePaymentKeyHash, cst } from "@meshsdk/core";
import { decodeFirst } from "cbor";
import { bech32 } from "bech32";
import type { Plutus } from "../types";
import { CIP68_PREFIX, ConfigService } from "../config/config.service";
import { blockfrostFetcher, blockfrostProvider } from "../cardano/standalone";
import { datumToJson, decodeReceivers, getPkHash } from "../cip68/utils";

const MULTISIG_SPEND_TITLE = "multisig.multisig.spend";
const MULTISIG_SPEND_TITLE_ALT = "multi_sig_wallet.multisig.spend";

export type MultisigDatum = {
  ownersPkh: string[];
  threshold: number;
  recipientPkh: string;
};

const REDEEMER_SPEND_CBOR = "d87980";

function normalizePkh(p: string): string {
  if (typeof p !== "string") return "";
  let h = p.toLowerCase().trim().replace(/^0x/, "");
  if (h.startsWith("5820")) h = h.slice(4);
  return /^[0-9a-f]{56}$/.test(h) ? h : "";
}

function normalizeOutputAmount(
  amount: Array<{ unit: string; quantity: string | number }>
): Array<{ unit: string; quantity: string }> {
  const list = Array.isArray(amount) ? amount : [];
  const lovelace = list.find((a) => a.unit === "lovelace");
  const others = list.filter((a) => a.unit !== "lovelace").map((a) => ({
    unit: a.unit,
    quantity: String(a.quantity ?? "0"),
  }));
  const lovelaceQty = lovelace != null ? String(lovelace.quantity ?? "0") : "0";
  return [{ unit: "lovelace", quantity: lovelaceQty }, ...others];
}

export type MultisigContractOpts = {
  plutus?: Plutus;
  appNetwork?: "mainnet" | "preprod" | "preview";
  validatorTitle?: string;
};

export class MultisigContract {
  private plutus: Plutus;
  private appNetwork: "mainnet" | "preprod" | "preview";
  private validatorTitle: string;
  private _scriptCbor: string | null = null;
  private _scriptAddress: string | null = null;

  constructor(opts: MultisigContractOpts = {}) {
    const config = new ConfigService();
    this.plutus = opts.plutus ?? config.getPlutus();
    this.validatorTitle = opts.validatorTitle ?? MULTISIG_SPEND_TITLE;
    const raw = (process.env.NEXT_PUBLIC_APP_NETWORK ?? "preprod").toLowerCase();
    this.appNetwork =
      opts.appNetwork ?? (raw === "mainnet" ? "mainnet" : "preprod");
  }

  private getValidator() {
    let v = this.plutus.validators.find((x) => x.title === this.validatorTitle);
    if (!v) v = this.plutus.validators.find((x) => x.title === MULTISIG_SPEND_TITLE);
    if (!v) v = this.plutus.validators.find((x) => x.title === MULTISIG_SPEND_TITLE_ALT);
    if (!v) throw new Error(`Validator ${this.validatorTitle} (or ${MULTISIG_SPEND_TITLE} / ${MULTISIG_SPEND_TITLE_ALT}) not found in plutus.json`);
    return v;
  }

  getScriptCbor(): string {
    if (this._scriptCbor) return this._scriptCbor;
    const v = this.getValidator();
    const code = v.compiledCode;
    const byteLength = code.length / 2;
    this._scriptCbor = "59" + byteLength.toString(16).padStart(4, "0") + code;
    return this._scriptCbor;
  }

  getScriptAddress(): string {
    if (this._scriptAddress) return this._scriptAddress;
    const v = this.getValidator();
    const scriptHashHex = v.hash;
    const hashBytes = Buffer.from(scriptHashHex, "hex");
    const networkId = this.appNetwork === "mainnet" ? 1 : 0;
    const headerByte = networkId === 1 ? 0x71 : 0x70;
    const addrBytes = Buffer.concat([Buffer.from([headerByte]), hashBytes]);
    const words = bech32.toWords(addrBytes as Uint8Array);
    const hrp = networkId === 1 ? "addr" : "addr_test";
    this._scriptAddress = bech32.encode(hrp, words, 1000);
    return this._scriptAddress;
  }

  getAddressFromPkh(pkhHex: string): string {
    if (!pkhHex || pkhHex.length !== 56) return "";
    const hashBytes = Buffer.from(pkhHex, "hex");
    const networkId = this.appNetwork === "mainnet" ? 1 : 0;
    const headerByte = networkId === 1 ? 0x61 : 0x60;
    const addrBytes = Buffer.concat([Buffer.from([headerByte]), hashBytes]);
    const words = bech32.toWords(addrBytes as Uint8Array);
    const hrp = networkId === 1 ? "addr" : "addr_test";
    return bech32.encode(hrp, words, 1000);
  }

  buildDatum(d: MultisigDatum): { alternative: number; fields: [string[], number, string] } {
    return {
      alternative: 0,
      fields: [d.ownersPkh, d.threshold, d.recipientPkh],
    };
  }

  async buildLockTx(params: {
    scriptAddress: string;
    ownersPkh: string[];
    threshold: number;
    recipientPkh: string;
    assets: { unit: string; quantity: string }[];
    changeAddress: string;
    utxos: UTxO[];
  }): Promise<string> {
    const {
      scriptAddress,
      ownersPkh,
      threshold,
      recipientPkh,
      assets,
      changeAddress,
      utxos,
    } = params;

    const config = new ConfigService();
    const prefix222 = config.cip68Prefix.USER_222;
    const nft222 = assets.find(
      (a) =>
        a.unit !== "lovelace" &&
        a.unit.length > 56 + prefix222.length &&
        a.unit.slice(56, 56 + prefix222.length) === prefix222
    );
    if (nft222) {
      await this.assertRecipientAllowedByRef100(recipientPkh, nft222.unit);
    }

    const datum = this.buildDatum({
      ownersPkh,
      threshold,
      recipientPkh,
    });
    const walletOnlyUtxos = utxos.filter(
      (u) => u.output.address === changeAddress
    );
    const txBuilder = new MeshTxBuilder({
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
    });
    txBuilder.setNetwork(this.appNetwork);

    const unsignedTx = await txBuilder
      .txOut(scriptAddress, assets)
      .txOutInlineDatumValue(datum)
      .changeAddress(changeAddress)
      .selectUtxosFrom(
        walletOnlyUtxos.length > 0 ? walletOnlyUtxos : utxos
      )
      .complete();

    return unsignedTx;
  }

  async buildUnlockTx(params: {
    scriptUtxo: UTxO;
    outputAddress: string;
    signingOwnersPkh: string[];
    threshold: number;
    collateral: UTxO;
    changeAddress: string;
    utxos: UTxO[];
  }): Promise<string> {
    const {
      scriptUtxo,
      outputAddress,
      signingOwnersPkh,
      threshold,
      collateral,
      changeAddress,
      utxos,
    } = params;

    if (signingOwnersPkh.length < threshold) {
      throw new Error(
        `signingOwnersPkh.length (${signingOwnersPkh.length}) < threshold (${threshold})`
      );
    }
    const uniquePkhs = [
      ...new Set(
        signingOwnersPkh.map((p) => normalizePkh(typeof p === "string" ? p : "")).filter(Boolean),
      ),
    ];
    if (uniquePkhs.length < threshold) {
      throw new Error(
        `After normalization: ${uniquePkhs.length} unique PKH(s) < threshold (${threshold})`
      );
    }
    const scriptCbor = this.getScriptCbor();
    const filteredUtxos = utxos.filter(
      (u) =>
        !(
          u.input.txHash === scriptUtxo.input.txHash &&
          u.input.outputIndex === scriptUtxo.input.outputIndex
        )
    );
    const walletOnlyUtxos = filteredUtxos.filter(
      (u) => u.output.address === changeAddress
    );

    const protocolParams = await blockfrostProvider.fetchProtocolParameters();
    const txBuilder = new MeshTxBuilder({
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      params: protocolParams,
    });
    txBuilder.setNetwork(this.appNetwork);

    const hasInlineDatum = !!scriptUtxo.output.plutusData;
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(
        scriptUtxo.input.txHash,
        scriptUtxo.input.outputIndex,
        scriptUtxo.output.amount,
        scriptUtxo.output.address
      )
      .txInScript(scriptCbor);

    if (hasInlineDatum) {
      txBuilder.txInInlineDatumPresent();
    } else if (scriptUtxo.output.plutusData) {
      txBuilder.txInDatumValue(scriptUtxo.output.plutusData, "CBOR");
    }

    txBuilder.txInRedeemerValue(REDEEMER_SPEND_CBOR, "CBOR", {
      mem: 16_000_000,
      steps: 9_500_000_000,
    });

    for (const pkh of uniquePkhs) {
      txBuilder.requiredSignerHash(pkh);
    }

    const outputAmount = normalizeOutputAmount(scriptUtxo.output.amount);
    txBuilder.txOut(outputAddress, outputAmount);
    txBuilder.txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    );

    const unsignedTx = await txBuilder
      .changeAddress(changeAddress)
      .selectUtxosFrom(walletOnlyUtxos.length > 0 ? walletOnlyUtxos : filteredUtxos)
      .complete();

    const tx = cst.deserializeTx(unsignedTx);
    const body = tx.body();
    const requiredSignersSet = cst.CborSet.fromCore(
      uniquePkhs.map((p) => cst.Ed25519KeyHashHex(p.toLowerCase())),
      cst.Hash.fromCore,
    );
    body.setRequiredSigners(requiredSignersSet);
    return new cst.Transaction(body, tx.witnessSet(), tx.auxiliaryData()).toCbor();
  }

  async parseDatumFromUtxo(utxo: UTxO): Promise<MultisigDatum> {
    const data = utxo.output.plutusData;
    if (!data) throw new Error("UTxO has no plutusData");

    if (typeof data !== "string") {
      const obj = data as { alternative?: number; fields?: unknown[] };
      if (Array.isArray(obj?.fields)) {
        const f = obj.fields;
        if (f.length >= 3) {
          const [owners, threshold, recipient] = f;
          const toHexFromDatumField = (o: unknown): string => {
            if (typeof o === "string") return normalizePkh(o);
            if (o && typeof o === "object" && "bytes" in o) {
              const b = (o as { bytes: string }).bytes;
              return typeof b === "string" ? normalizePkh(b) : "";
            }
            return normalizePkh(String(o));
          };
          const ownersPkh = Array.isArray(owners)
            ? owners.map((o: unknown) => toHexFromDatumField(o)).filter(Boolean)
            : [];
          const recipientPkh = toHexFromDatumField(recipient);
          const fallbackRecipient = typeof recipient === "string" ? recipient : String(recipient);
          let finalRecipient = recipientPkh;
          if (!finalRecipient && fallbackRecipient) {
            const h = fallbackRecipient.toLowerCase().replace(/^0x/, "").replace(/^5820/, "");
            finalRecipient = h.length >= 56 ? h.slice(-56) : h.length === 56 ? h : fallbackRecipient;
          }
          return {
            ownersPkh,
            threshold: Number(threshold ?? 0),
            recipientPkh: finalRecipient || fallbackRecipient,
          };
        }
      }
    }

    try {
      const buffer = Buffer.from(data as string, "hex");
      const decoded = await decodeFirst(buffer);
      const value = (decoded as { value?: unknown[] })?.value ?? decoded;
      const raw = Array.isArray(value) ? value : [value];
      const fields =
        raw.length >= 4 && typeof raw[0] === "number"
          ? raw.slice(1)
          : raw.length >= 3
            ? raw
            : raw[0] != null && Array.isArray(raw[0])
              ? raw[0]
              : raw;
      if (!Array.isArray(fields) || fields.length < 3) {
        throw new Error("Invalid datum");
      }
      const toHex = (x: unknown) =>
        Buffer.isBuffer(x) || x instanceof Uint8Array
          ? Buffer.from(x).toString("hex").toLowerCase()
          : String(x);
      const ownersRaw = fields[0];
      const ownersPkh = Array.isArray(ownersRaw)
        ? ownersRaw.map((b) => normalizePkh(toHex(b))).filter(Boolean)
        : [];
      const recipientHex = toHex(fields[2]);
      const result: MultisigDatum = {
        ownersPkh,
        threshold: Number(fields[1]) || 0,
        recipientPkh: normalizePkh(recipientHex) || recipientHex,
      };
      return result;
    } catch (e) {
      throw new Error(
        `Unsupported datum format: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  private async getAllowedPkhsFromRef100ByNftUnit(nftUnit222: string): Promise<string[]> {
    if (!nftUnit222 || nftUnit222.length <= 56 + CIP68_PREFIX.USER_222.length) {
      return [];
    }
    const policyId = nftUnit222.slice(0, 56);
    const rest = nftUnit222.slice(56);
    if (!rest.startsWith(CIP68_PREFIX.USER_222)) {
      return [];
    }
    const assetNameHex = rest.slice(CIP68_PREFIX.USER_222.length);
    const unit100 = policyId + CIP68_PREFIX.REFERENCE_100 + assetNameHex;

    const txList = await blockfrostFetcher.fetchAssetTransactions(unit100);
    if (!Array.isArray(txList) || txList.length === 0) return [];

    let outputWithUnit: any | undefined;
    for (const tx of [...txList].reverse()) {
      const txHash = (tx as { tx_hash: string }).tx_hash;
      const txUtxos = await blockfrostFetcher.fetchTransactionsUTxO(txHash);
      const outputs = (txUtxos as { outputs?: any[] }).outputs ?? [];
      outputWithUnit = outputs.find((o: any) =>
        o.amount?.some((a: { unit: string }) => a.unit === unit100)
      );
      if (outputWithUnit && outputWithUnit.inline_datum) break;
    }
    if (!outputWithUnit || !outputWithUnit.inline_datum) return [];
    const datum = String(outputWithUnit.inline_datum);

    const meta = (await datumToJson(datum, { contain_pk: true })) as Record<string, string>;
    const minterPk = meta._pk ?? (await getPkHash(datum)) ?? "";
    const receivers = decodeReceivers(meta.receivers);
    const allowed = new Set<string>();
    if (minterPk) allowed.add(minterPk.toLowerCase());
    for (const r of receivers) {
      const raw = (r.pubKeyHash ?? "").trim();
      if (!raw) continue;
      let pkh = raw;
      if (raw.startsWith("addr")) {
        try {
          pkh = resolvePaymentKeyHash(raw);
        } catch {
          // ignore, fallback to raw
        }
      }
      if (pkh) {
        allowed.add(pkh.toLowerCase());
      }
    }
    return Array.from(allowed);
  }

  private async assertRecipientAllowedByRef100(
    recipientPkh: string,
    nftUnit222: string
  ): Promise<void> {
    const allowed = await this.getAllowedPkhsFromRef100ByNftUnit(nftUnit222);
    const recipientLower = recipientPkh.toLowerCase();
    if (allowed.length === 0) {
      throw new Error(
        "Ref100 metadata for NFT not found — cannot verify traceability chain."
      );
    }
    if (!allowed.includes(recipientLower)) {
      const defaultEAddress = process.env.E_ADDRESS?.trim() ?? "";
      let defaultEPkh: string | null = null;
      if (defaultEAddress && defaultEAddress.startsWith("addr")) {
        try {
          defaultEPkh = resolvePaymentKeyHash(defaultEAddress);
        } catch {
          defaultEPkh = null;
        }
      }
      throw new Error(
        `Recipient is not in the traceability chain (Ref100.receivers/_pk). ` +
          `recipientLower=${recipientLower}, allowedSample=${allowed
            .slice(0, 5)
            .join(",")}`
      );
    }
  }
}
