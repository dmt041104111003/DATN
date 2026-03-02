"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshAdapter = void 0;
const core_1 = require("@meshsdk/core");
const config_service_1 = require("../../config/config.service");
const standalone_1 = require("../standalone");
function toUtxo(input, output) {
    var _a, _b, _c;
    return {
        input,
        output: {
            address: output.address,
            amount: output.amount,
            plutusData: (_a = output.inline_datum) !== null && _a !== void 0 ? _a : undefined,
            dataHash: (_b = output.data_hash) !== null && _b !== void 0 ? _b : undefined,
            scriptHash: (_c = output.reference_script_hash) !== null && _c !== void 0 ? _c : undefined,
        },
    };
}
class MeshAdapter {
    constructor(opts = {}) {
        this.getWalletForTx = async () => {
            await this._initPromise;
            const utxos = await this.wallet.getUtxos();
            const collaterals = await this.wallet.getCollateral();
            const walletAddress = await this.wallet.getChangeAddress();
            if (!utxos || utxos.length === 0) {
                throw new Error("No UTXOs found in getWalletForTx method.");
            }
            if (!collaterals || collaterals.length === 0) {
                throw new Error("No collateral found in getWalletForTx method.");
            }
            if (!walletAddress) {
                throw new Error("No wallet address found in getWalletForTx method.");
            }
            return { utxos, collateral: collaterals[0], walletAddress };
        };
        this.getUtxoForTx = async (address, txHash) => {
            const utxosAtAddress = await this.fetcher.fetchAddressUTxOs(address);
            const match = utxosAtAddress.find((u) => u.input.txHash === txHash);
            if (!match) {
                throw new Error("No UTXOs found in getUtxoForTx method.");
            }
            return match;
        };
        this.readValidator = function (plutusJson, validatorTitle) {
            const validator = plutusJson.validators.find((v) => v.title === validatorTitle);
            if (!validator) {
                throw new Error(`${validatorTitle} validator not found.`);
            }
            return validator.compiledCode;
        };
        this.getPolicyIdFromWalletRft = async (walletAddress, rftSuffix) => {
            var _a;
            await this._initPromise;
            const utxosAtAddress = await this.blockfrostFetcher.fetchUtxoByAddress(walletAddress);
            for (const utxo of utxosAtAddress !== null && utxosAtAddress !== void 0 ? utxosAtAddress : []) {
                for (const amountEntry of (_a = utxo.amount) !== null && _a !== void 0 ? _a : []) {
                    const unit = amountEntry.unit;
                    if ((unit === null || unit === void 0 ? void 0 : unit.endsWith(rftSuffix)) && unit.length >= 56 + rftSuffix.length) {
                        return unit.slice(0, 56);
                    }
                }
            }
            return undefined;
        };
        this.getUtxoContainingUnit = async (unit) => {
            var _a;
            await this._initPromise;
            const txList = await this.blockfrostFetcher.fetchAssetTransactions(unit);
            if (!Array.isArray(txList) || txList.length === 0)
                return undefined;
            const firstTxHash = txList[0].tx_hash;
            const txUtxos = await this.blockfrostFetcher.fetchTransactionsUTxO(firstTxHash);
            const outputs = (_a = txUtxos.outputs) !== null && _a !== void 0 ? _a : [];
            const outputWithUnit = outputs.find((o) => { var _a; return (_a = o.amount) === null || _a === void 0 ? void 0 : _a.some((a) => a.unit === unit); });
            if (!outputWithUnit || !("output_index" in outputWithUnit))
                return undefined;
            const output = outputWithUnit;
            return toUtxo({ txHash: firstTxHash, outputIndex: output.output_index }, output);
        };
        this.getAddressUTXOAsset = async (address, unit) => {
            await this._initPromise;
            const utxosAtAddress = await this.blockfrostFetcher.fetchUtxoByAddress(address);
            const utxoWithUnit = utxosAtAddress === null || utxosAtAddress === void 0 ? void 0 : utxosAtAddress.find((u) => { var _a; return (_a = u.amount) === null || _a === void 0 ? void 0 : _a.some((a) => a.unit === unit); });
            if (!utxoWithUnit)
                return undefined;
            return toUtxo({ txHash: utxoWithUnit.tx_hash, outputIndex: utxoWithUnit.output_index }, utxoWithUnit);
        };
        this.getAddressUTXOAssets = async (address, unit) => {
            var _a;
            await this._initPromise;
            const utxosAtAddress = await this.blockfrostFetcher.fetchUtxoByAddress(address);
            const utxosWithUnit = (_a = utxosAtAddress === null || utxosAtAddress === void 0 ? void 0 : utxosAtAddress.filter((u) => { var _a; return (_a = u.amount) === null || _a === void 0 ? void 0 : _a.some((a) => a.unit === unit); })) !== null && _a !== void 0 ? _a : [];
            return utxosWithUnit.map((utxo) => toUtxo({ txHash: utxo.tx_hash, outputIndex: utxo.output_index }, utxo));
        };
        const { wallet = null, minterMintScriptCbor, fetcher, provider, blockfrostFetcher: bf, plutus, appNetworkId, title, } = opts;
        this.wallet = wallet;
        this.minterMintScriptCbor = minterMintScriptCbor;
        this.fetcher = fetcher !== null && fetcher !== void 0 ? fetcher : standalone_1.blockfrostProvider;
        this.blockfrostFetcher = bf !== null && bf !== void 0 ? bf : standalone_1.blockfrostFetcher;
        this.meshTxBuilder = new core_1.MeshTxBuilder({
            fetcher: this.fetcher,
            evaluator: provider !== null && provider !== void 0 ? provider : standalone_1.blockfrostProvider,
        });
        const config = new config_service_1.ConfigService();
        const plutusResolved = plutus !== null && plutus !== void 0 ? plutus : config.getPlutus();
        const networkIdResolved = appNetworkId !== null && appNetworkId !== void 0 ? appNetworkId : config.appNetworkId;
        const titleResolved = title !== null && title !== void 0 ? title : config.validatorTitle;
        this._initPromise = this.init(plutusResolved, networkIdResolved, titleResolved);
    }
    async init(plutusJson, appNetworkId, title) {
        const config = new config_service_1.ConfigService();
        const plutus = plutusJson !== null && plutusJson !== void 0 ? plutusJson : config.getPlutus();
        const networkId = appNetworkId !== null && appNetworkId !== void 0 ? appNetworkId : config.appNetworkId;
        const t = title !== null && title !== void 0 ? title : config.validatorTitle;
        const changeAddress = await this.wallet.getChangeAddress();
        this.pubKeyIssuer = (0, core_1.deserializeAddress)(changeAddress).pubKeyHash;
        this.stakeCredentialHash = (0, core_1.deserializeAddress)(changeAddress).stakeCredentialHash;
        this.mintCompileCode = this.readValidator(plutus, t.mint);
        this.storeCompileCode = this.readValidator(plutus, t.store);
        this.storeScriptCbor = (0, core_1.applyParamsToScript)(this.storeCompileCode, [
            this.pubKeyIssuer,
        ]);
        this.storeScript = { code: this.storeScriptCbor, version: "V3" };
        const storeScriptAddress = (0, core_1.serializePlutusScript)(this.storeScript, undefined, networkId, false).address;
        const storeScriptHash = (0, core_1.deserializeAddress)(storeScriptAddress).scriptHash;
        this.storeAddress = (0, core_1.serializeAddressObj)((0, core_1.scriptAddress)(storeScriptHash, this.stakeCredentialHash, false), networkId);
        this.storeScriptHash = (0, core_1.deserializeAddress)(this.storeAddress).scriptHash;
        this.mintScriptCbor = (0, core_1.applyParamsToScript)(this.mintCompileCode, [
            this.storeScriptHash,
            this.stakeCredentialHash,
            this.pubKeyIssuer,
        ]);
        this.mintScript = { code: this.mintScriptCbor, version: "V3" };
        this.policyId = (0, core_1.resolveScriptHash)(this.mintScriptCbor, "V3");
    }
    getMintScriptCbor() {
        return this.mintScriptCbor;
    }
}
exports.MeshAdapter = MeshAdapter;
//# sourceMappingURL=mesh.adapter.js.map