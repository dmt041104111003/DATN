"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultisigContract = void 0;
const core_1 = require("@meshsdk/core");
const bech32_1 = require("bech32");
const config_service_1 = require("../config/config.service");
const standalone_1 = require("../cardano/standalone");
const multisig_types_1 = require("./multisig.types");
const multisig_traceability_1 = require("./multisig.traceability");
const MULTISIG_SPEND_TITLE = "multisig.multisig.spend";
const MULTISIG_SPEND_TITLE_ALT = "multi_sig_wallet.multisig.spend";
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
class MultisigContract {
    constructor(opts = {}) {
        var _a, _b, _c, _d;
        this._scriptCbor = null;
        this._scriptAddress = null;
        const config = new config_service_1.ConfigService();
        this.plutus = (_a = opts.plutus) !== null && _a !== void 0 ? _a : config.getPlutus();
        this.validatorTitle = (_b = opts.validatorTitle) !== null && _b !== void 0 ? _b : MULTISIG_SPEND_TITLE;
        const raw = ((_c = process.env.NEXT_PUBLIC_APP_NETWORK) !== null && _c !== void 0 ? _c : "preprod").toLowerCase();
        this.appNetwork =
            (_d = opts.appNetwork) !== null && _d !== void 0 ? _d : (raw === "mainnet" ? "mainnet" : "preprod");
    }
    getValidator() {
        let v = this.plutus.validators.find((x) => x.title === this.validatorTitle);
        if (!v)
            v = this.plutus.validators.find((x) => x.title === MULTISIG_SPEND_TITLE);
        if (!v)
            v = this.plutus.validators.find((x) => x.title === MULTISIG_SPEND_TITLE_ALT);
        if (!v) {
            throw new Error(`Validator ${this.validatorTitle} (or ${MULTISIG_SPEND_TITLE} / ${MULTISIG_SPEND_TITLE_ALT}) not found in plutus.json`);
        }
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
        const nft222 = assets.find((a) => {
            if (a.unit === "lovelace")
                return false;
            if (a.unit.length <= multisig_types_1.POLICY_ID_HEX_LENGTH + prefix222.length)
                return false;
            const labelPart = a.unit.slice(multisig_types_1.POLICY_ID_HEX_LENGTH, multisig_types_1.POLICY_ID_HEX_LENGTH + prefix222.length);
            return labelPart === prefix222;
        });
        if (nft222) {
            await (0, multisig_traceability_1.assertRecipientAllowedByRef100)(recipientPkh, nft222.unit);
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
        txBuilder.txInRedeemerValue(multisig_types_1.REDEEMER_SPEND_CBOR, "CBOR", {
            mem: multisig_types_1.DEFAULT_SPEND_MEM,
            steps: multisig_types_1.DEFAULT_SPEND_STEPS,
        });
        for (const pkh of signingOwnersPkh) {
            if (pkh.length === 56)
                txBuilder.requiredSignerHash(pkh);
        }
        const outputAmount = normalizeOutputAmount(scriptUtxo.output.amount);
        txBuilder.txOut(outputAddress, outputAmount);
        txBuilder.txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address);
        const unsignedTx = await txBuilder
            .changeAddress(changeAddress)
            .selectUtxosFrom(walletOnlyUtxos.length > 0 ? walletOnlyUtxos : filteredUtxos)
            .complete();
        return unsignedTx;
    }
    async parseDatumFromUtxo(utxo) {
        return (0, multisig_traceability_1.parseMultisigDatumFromUtxo)(utxo);
    }
}
exports.MultisigContract = MultisigContract;
//# sourceMappingURL=multisig.contract.js.map