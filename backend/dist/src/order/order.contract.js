"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderContract = void 0;
const core_1 = require("@meshsdk/core");
const cbor_1 = require("cbor");
const bech32_1 = require("bech32");
const config_service_1 = require("../config/config.service");
const standalone_1 = require("../cardano/standalone");
const utils_1 = require("../cip68/utils");
const SCRIPT_VALIDATOR_TITLE = "multisig.multisig.spend";
const SCRIPT_VALIDATOR_TITLE_ALT = "multi_sig_wallet.multisig.spend";
const REDEEMER_SPEND_CBOR = "d87980";
function normalizePkh(p) {
    if (typeof p !== "string")
        return "";
    let h = p.toLowerCase().trim().replace(/^0x/, "");
    if (h.startsWith("5820"))
        h = h.slice(4);
    return /^[0-9a-f]{56}$/.test(h) ? h : "";
}
function normalizeOutputAmount(amount) {
    var _a;
    const list = Array.isArray(amount) ? amount : [];
    const lovelace = list.find((a) => a.unit === "lovelace");
    const others = list.filter((a) => a.unit !== "lovelace").map((a) => {
        var _a;
        return ({
            unit: a.unit,
            quantity: String((_a = a.quantity) !== null && _a !== void 0 ? _a : "0"),
        });
    });
    const lovelaceQty = lovelace != null ? String((_a = lovelace.quantity) !== null && _a !== void 0 ? _a : "0") : "0";
    return [{ unit: "lovelace", quantity: lovelaceQty }, ...others];
}
class OrderContract {
    constructor(opts = {}) {
        var _a, _b, _c, _d;
        this._scriptCbor = null;
        this._scriptAddress = null;
        const config = new config_service_1.ConfigService();
        this.plutus = (_a = opts.plutus) !== null && _a !== void 0 ? _a : config.getPlutus();
        this.validatorTitle = (_b = opts.validatorTitle) !== null && _b !== void 0 ? _b : SCRIPT_VALIDATOR_TITLE;
        const raw = ((_c = process.env.NEXT_PUBLIC_APP_NETWORK) !== null && _c !== void 0 ? _c : "preprod").toLowerCase();
        this.appNetwork =
            (_d = opts.appNetwork) !== null && _d !== void 0 ? _d : (raw === "mainnet" ? "mainnet" : "preprod");
    }
    getValidator() {
        let v = this.plutus.validators.find((x) => x.title === this.validatorTitle);
        if (!v)
            v = this.plutus.validators.find((x) => x.title === SCRIPT_VALIDATOR_TITLE);
        if (!v)
            v = this.plutus.validators.find((x) => x.title === SCRIPT_VALIDATOR_TITLE_ALT);
        if (!v)
            throw new Error(`Validator ${this.validatorTitle} not found in plutus.json`);
        return v;
    }
    getScriptCbor() {
        if (this._scriptCbor)
            return this._scriptCbor;
        const v = this.getValidator();
        const code = v.compiledCode;
        const byteLength = code.length / 2;
        this._scriptCbor = "59" + byteLength.toString(16).padStart(4, "0") + code;
        return this._scriptCbor;
    }
    getScriptAddress() {
        if (this._scriptAddress)
            return this._scriptAddress;
        const v = this.getValidator();
        const scriptHashHex = v.hash;
        const hashBytes = Buffer.from(scriptHashHex, "hex");
        const networkId = this.appNetwork === "mainnet" ? 1 : 0;
        const headerByte = networkId === 1 ? 0x71 : 0x70;
        const addrBytes = Buffer.concat([Buffer.from([headerByte]), hashBytes]);
        const words = bech32_1.bech32.toWords(addrBytes);
        const hrp = networkId === 1 ? "addr" : "addr_test";
        this._scriptAddress = bech32_1.bech32.encode(hrp, words, 1000);
        return this._scriptAddress;
    }
    getAddressFromPkh(pkhHex) {
        if (!pkhHex || pkhHex.length !== 56)
            return "";
        const hashBytes = Buffer.from(pkhHex, "hex");
        const networkId = this.appNetwork === "mainnet" ? 1 : 0;
        const headerByte = networkId === 1 ? 0x61 : 0x60;
        const addrBytes = Buffer.concat([Buffer.from([headerByte]), hashBytes]);
        const words = bech32_1.bech32.toWords(addrBytes);
        const hrp = networkId === 1 ? "addr" : "addr_test";
        return bech32_1.bech32.encode(hrp, words, 1000);
    }
    buildDatum(d) {
        return {
            alternative: 0,
            fields: [d.ownersPkh, d.threshold, d.recipientPkh],
        };
    }
    async buildLockTx(params) {
        const { scriptAddress, ownersPkh, threshold, recipientPkh, assets, changeAddress, utxos, } = params;
        const config = new config_service_1.ConfigService();
        const prefix222 = config.cip68Prefix.USER_222;
        const nft222 = assets.find((a) => a.unit !== "lovelace" &&
            a.unit.length > 56 + prefix222.length &&
            a.unit.slice(56, 56 + prefix222.length) === prefix222);
        if (nft222) {
            await this.assertRecipientAllowedByRef100(recipientPkh, nft222.unit);
        }
        const datum = this.buildDatum({
            ownersPkh,
            threshold,
            recipientPkh,
        });
        const walletOnlyUtxos = utxos.filter((u) => u.output.address === changeAddress);
        const txBuilder = new core_1.MeshTxBuilder({
            fetcher: standalone_1.blockfrostProvider,
            submitter: standalone_1.blockfrostProvider,
        });
        txBuilder.setNetwork(this.appNetwork);
        const unsignedTx = await txBuilder
            .txOut(scriptAddress, assets)
            .txOutInlineDatumValue(datum)
            .changeAddress(changeAddress)
            .selectUtxosFrom(walletOnlyUtxos.length > 0 ? walletOnlyUtxos : utxos)
            .complete();
        return unsignedTx;
    }
    async buildUnlockTx(params) {
        const { scriptUtxo, outputAddress, signingOwnersPkh, threshold, collateral, changeAddress, utxos, } = params;
        if (signingOwnersPkh.length < threshold) {
            throw new Error(`signingOwnersPkh.length (${signingOwnersPkh.length}) < threshold (${threshold})`);
        }
        const uniquePkhs = [
            ...new Set(signingOwnersPkh.map((p) => normalizePkh(typeof p === "string" ? p : "")).filter(Boolean)),
        ];
        if (uniquePkhs.length < threshold) {
            throw new Error(`After normalization: ${uniquePkhs.length} unique PKH(s) < threshold (${threshold})`);
        }
        const scriptCbor = this.getScriptCbor();
        const filteredUtxos = utxos.filter((u) => !(u.input.txHash === scriptUtxo.input.txHash &&
            u.input.outputIndex === scriptUtxo.input.outputIndex));
        const walletOnlyUtxos = filteredUtxos.filter((u) => u.output.address === changeAddress);
        const protocolParams = await standalone_1.blockfrostProvider.fetchProtocolParameters();
        const txBuilder = new core_1.MeshTxBuilder({
            fetcher: standalone_1.blockfrostProvider,
            submitter: standalone_1.blockfrostProvider,
            params: protocolParams,
        });
        txBuilder.setNetwork(this.appNetwork);
        const hasInlineDatum = !!scriptUtxo.output.plutusData;
        txBuilder
            .spendingPlutusScriptV3()
            .txIn(scriptUtxo.input.txHash, scriptUtxo.input.outputIndex, scriptUtxo.output.amount, scriptUtxo.output.address)
            .txInScript(scriptCbor);
        if (hasInlineDatum) {
            txBuilder.txInInlineDatumPresent();
        }
        else if (scriptUtxo.output.plutusData) {
            txBuilder.txInDatumValue(scriptUtxo.output.plutusData, "CBOR");
        }
        txBuilder.txInRedeemerValue(REDEEMER_SPEND_CBOR, "CBOR", {
            mem: 16000000,
            steps: 9500000000,
        });
        for (const pkh of uniquePkhs) {
            txBuilder.requiredSignerHash(pkh);
        }
        const outputAmount = normalizeOutputAmount(scriptUtxo.output.amount);
        txBuilder.txOut(outputAddress, outputAmount);
        txBuilder.txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address);
        const unsignedTx = await txBuilder
            .changeAddress(changeAddress)
            .selectUtxosFrom(walletOnlyUtxos.length > 0 ? walletOnlyUtxos : filteredUtxos)
            .complete();
        const tx = core_1.cst.deserializeTx(unsignedTx);
        const body = tx.body();
        const requiredSignersSet = core_1.cst.CborSet.fromCore(uniquePkhs.map((p) => core_1.cst.Ed25519KeyHashHex(p.toLowerCase())), core_1.cst.Hash.fromCore);
        body.setRequiredSigners(requiredSignersSet);
        return new core_1.cst.Transaction(body, tx.witnessSet(), tx.auxiliaryData()).toCbor();
    }
    async parseDatumFromUtxo(utxo) {
        var _a;
        const data = utxo.output.plutusData;
        if (!data)
            throw new Error("UTxO has no plutusData");
        if (typeof data !== "string") {
            const obj = data;
            if (Array.isArray(obj === null || obj === void 0 ? void 0 : obj.fields)) {
                const f = obj.fields;
                if (f.length >= 3) {
                    const [owners, threshold, recipient] = f;
                    const toHexFromDatumField = (o) => {
                        if (typeof o === "string")
                            return normalizePkh(o);
                        if (o && typeof o === "object" && "bytes" in o) {
                            const b = o.bytes;
                            return typeof b === "string" ? normalizePkh(b) : "";
                        }
                        return normalizePkh(String(o));
                    };
                    const ownersPkh = Array.isArray(owners)
                        ? owners.map((o) => toHexFromDatumField(o)).filter(Boolean)
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
                        threshold: Number(threshold !== null && threshold !== void 0 ? threshold : 0),
                        recipientPkh: finalRecipient || fallbackRecipient,
                    };
                }
            }
        }
        try {
            const buffer = Buffer.from(data, "hex");
            const decoded = await (0, cbor_1.decodeFirst)(buffer);
            const value = (_a = decoded === null || decoded === void 0 ? void 0 : decoded.value) !== null && _a !== void 0 ? _a : decoded;
            const raw = Array.isArray(value) ? value : [value];
            const fields = raw.length >= 4 && typeof raw[0] === "number"
                ? raw.slice(1)
                : raw.length >= 3
                    ? raw
                    : raw[0] != null && Array.isArray(raw[0])
                        ? raw[0]
                        : raw;
            if (!Array.isArray(fields) || fields.length < 3) {
                throw new Error("Invalid datum");
            }
            const toHex = (x) => Buffer.isBuffer(x) || x instanceof Uint8Array
                ? Buffer.from(x).toString("hex").toLowerCase()
                : String(x);
            const ownersRaw = fields[0];
            const ownersPkh = Array.isArray(ownersRaw)
                ? ownersRaw.map((b) => normalizePkh(toHex(b))).filter(Boolean)
                : [];
            const recipientHex = toHex(fields[2]);
            const result = {
                ownersPkh,
                threshold: Number(fields[1]) || 0,
                recipientPkh: normalizePkh(recipientHex) || recipientHex,
            };
            return result;
        }
        catch (e) {
            throw new Error(`Unsupported datum format: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
    async getAllowedPkhsFromRef100ByNftUnit(nftUnit222) {
        var _a, _b, _c, _d;
        if (!nftUnit222 || nftUnit222.length <= 56 + config_service_1.CIP68_PREFIX.USER_222.length) {
            return [];
        }
        const policyId = nftUnit222.slice(0, 56);
        const rest = nftUnit222.slice(56);
        if (!rest.startsWith(config_service_1.CIP68_PREFIX.USER_222)) {
            return [];
        }
        const assetNameHex = rest.slice(config_service_1.CIP68_PREFIX.USER_222.length);
        const unit100 = policyId + config_service_1.CIP68_PREFIX.REFERENCE_100 + assetNameHex;
        const txList = await standalone_1.blockfrostFetcher.fetchAssetTransactions(unit100);
        if (!Array.isArray(txList) || txList.length === 0)
            return [];
        let outputWithUnit;
        for (const tx of [...txList].reverse()) {
            const txHash = tx.tx_hash;
            const txUtxos = await standalone_1.blockfrostFetcher.fetchTransactionsUTxO(txHash);
            const outputs = (_a = txUtxos.outputs) !== null && _a !== void 0 ? _a : [];
            outputWithUnit = outputs.find((o) => { var _a; return (_a = o.amount) === null || _a === void 0 ? void 0 : _a.some((a) => a.unit === unit100); });
            if (outputWithUnit && outputWithUnit.inline_datum)
                break;
        }
        if (!outputWithUnit || !outputWithUnit.inline_datum)
            return [];
        const datum = String(outputWithUnit.inline_datum);
        const meta = (await (0, utils_1.datumToJson)(datum, { contain_pk: true }));
        const minterPk = (_c = (_b = meta._pk) !== null && _b !== void 0 ? _b : (await (0, utils_1.getPkHash)(datum))) !== null && _c !== void 0 ? _c : "";
        const receivers = (0, utils_1.decodeReceivers)(meta.receivers);
        const allowed = new Set();
        if (minterPk)
            allowed.add(minterPk.toLowerCase());
        for (const r of receivers) {
            const raw = ((_d = r.pubKeyHash) !== null && _d !== void 0 ? _d : "").trim();
            if (!raw)
                continue;
            let pkh = raw;
            if (raw.startsWith("addr")) {
                try {
                    pkh = (0, core_1.resolvePaymentKeyHash)(raw);
                }
                catch (_e) {
                }
            }
            if (pkh) {
                allowed.add(pkh.toLowerCase());
            }
        }
        return Array.from(allowed);
    }
    async assertRecipientAllowedByRef100(recipientPkh, nftUnit222) {
        const allowed = await this.getAllowedPkhsFromRef100ByNftUnit(nftUnit222);
        const recipientLower = recipientPkh.toLowerCase();
        if (allowed.length === 0) {
            throw new Error("Ref100 metadata for NFT not found — cannot verify traceability chain.");
        }
        if (!allowed.includes(recipientLower)) {
            throw new Error(`Recipient is not in the traceability chain (Ref100.receivers/_pk).`);
        }
    }
}
exports.OrderContract = OrderContract;
//# sourceMappingURL=order.contract.js.map