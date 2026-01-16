"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshAdapter = void 0;
const core_1 = require("@meshsdk/core");
const constants_1 = require("./constants");
const plutus_json_1 = __importDefault(require("../../plutus.json"));
class MeshAdapter {
    meshTxBuilder;
    wallet;
    fetcher;
    blockfrostProvider;
    pubKeyExchange;
    pubKeyIssuer;
    mintCompileCode;
    storeCompileCode;
    storeScriptCbor;
    storeScript;
    storeAddress;
    storeScriptHash;
    mintScriptCbor;
    mintScript;
    policyId;
    initialized = false;
    constructor(wallet) {
        this.blockfrostProvider = new core_1.BlockfrostProvider(constants_1.BLOCKFROST_API_KEY);
        this.fetcher = this.blockfrostProvider;
        if (wallet) {
            this.wallet = wallet;
        }
        else {
            this.wallet = new core_1.MeshWallet({
                networkId: constants_1.appNetworkId,
                fetcher: this.blockfrostProvider,
                submitter: this.blockfrostProvider,
                key: { type: 'mnemonic', words: constants_1.APP_MNEMONIC.split(' ') },
            });
        }
        this.meshTxBuilder = this.createMeshTxBuilder();
    }
    createMeshTxBuilder() {
        return new core_1.MeshTxBuilder({
            fetcher: this.fetcher,
            evaluator: this.blockfrostProvider,
        });
    }
    async init() {
        if (this.initialized)
            return;
        this.pubKeyIssuer = (0, core_1.deserializeAddress)(await this.wallet.getChangeAddress()).pubKeyHash;
        this.pubKeyExchange = (0, core_1.deserializeAddress)(constants_1.APP_WALLET_ADDRESS).pubKeyHash;
        this.mintCompileCode = this.readValidator(plutus_json_1.default, constants_1.title.mint);
        this.storeCompileCode = this.readValidator(plutus_json_1.default, constants_1.title.store);
        this.storeScriptCbor = (0, core_1.applyParamsToScript)(this.storeCompileCode, [
            this.pubKeyExchange,
            BigInt(1),
            this.pubKeyIssuer,
        ]);
        this.storeScript = { code: this.storeScriptCbor, version: 'V3' };
        this.storeAddress = (0, core_1.serializeAddressObj)((0, core_1.scriptAddress)((0, core_1.deserializeAddress)((0, core_1.serializePlutusScript)(this.storeScript, undefined, constants_1.appNetworkId, false)
            .address).scriptHash, (0, core_1.deserializeAddress)(constants_1.APP_WALLET_ADDRESS).stakeCredentialHash, false), constants_1.appNetworkId);
        this.storeScriptHash = (0, core_1.deserializeAddress)(this.storeAddress).scriptHash;
        this.mintScriptCbor = (0, core_1.applyParamsToScript)(this.mintCompileCode, [
            this.pubKeyExchange,
            BigInt(1),
            this.storeScriptHash,
            (0, core_1.deserializeAddress)(constants_1.APP_WALLET_ADDRESS).stakeCredentialHash,
            this.pubKeyIssuer,
        ]);
        this.mintScript = { code: this.mintScriptCbor, version: 'V3' };
        this.policyId = (0, core_1.resolveScriptHash)(this.mintScriptCbor, 'V3');
        this.initialized = true;
    }
    async getWalletForTx() {
        const utxos = await this.wallet.getUtxos();
        const walletAddress = await this.wallet.getChangeAddress();
        if (!utxos || utxos.length === 0) {
            throw new Error('No UTXOs found');
        }
        if (!walletAddress) {
            throw new Error('No wallet address found');
        }
        let collaterals = await this.wallet.getCollateral();
        if (!collaterals || collaterals.length === 0) {
            const suitableUtxo = utxos.find((utxo) => {
                const hasOnlyLovelace = utxo.output.amount.length === 1
                    && utxo.output.amount[0].unit === 'lovelace';
                const lovelace = BigInt(utxo.output.amount[0].quantity);
                return hasOnlyLovelace && lovelace >= 5000000n;
            });
            if (!suitableUtxo) {
                throw new Error('No suitable UTxO for collateral (need >= 5 ADA with no tokens)');
            }
            collaterals = [suitableUtxo];
        }
        return { utxos, collateral: collaterals[0], walletAddress };
    }
    readValidator(plutus, title) {
        const validator = plutus.validators.find((v) => v.title === title);
        if (!validator) {
            throw new Error(`${title} validator not found`);
        }
        return validator.compiledCode;
    }
    async getAddressUTXOAsset(address, unit) {
        const utxos = await this.fetcher.fetchAddressUTxOs(address, unit);
        return utxos[utxos.length - 1];
    }
    async getAddressUTXOAssets(address, unit) {
        return this.fetcher.fetchAddressUTxOs(address, unit);
    }
    async signAndSubmit(unsignedTx) {
        const signedTx = await this.wallet.signTx(unsignedTx, true);
        const txHash = await this.wallet.submitTx(signedTx);
        return txHash;
    }
    async waitForConfirmation(txHash) {
        return new Promise((resolve) => {
            this.blockfrostProvider.onTxConfirmed(txHash, () => {
                resolve();
            });
        });
    }
}
exports.MeshAdapter = MeshAdapter;
//# sourceMappingURL=mesh.adapter.js.map