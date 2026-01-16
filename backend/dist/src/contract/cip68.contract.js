"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cip68Contract = void 0;
const core_1 = require("@meshsdk/core");
const constants_1 = require("./constants");
const plutus_json_1 = __importDefault(require("../../plutus.json"));
class Cip68Contract {
    meshTxBuilder;
    wallet;
    fetcher;
    blockfrostProvider;
    pubKeyExchange;
    pubKeyIssuer;
    storeScriptCbor;
    mintScriptCbor;
    storeAddress;
    policyId;
    constructor({ wallet }) {
        this.wallet = wallet;
        this.blockfrostProvider = new core_1.BlockfrostProvider(constants_1.BLOCKFROST_API_KEY);
        this.fetcher = this.blockfrostProvider;
        this.meshTxBuilder = new core_1.MeshTxBuilder({
            fetcher: this.fetcher,
            evaluator: this.blockfrostProvider,
        });
        this.pubKeyIssuer = (0, core_1.deserializeAddress)(this.wallet.getChangeAddress()).pubKeyHash;
        this.pubKeyExchange = (0, core_1.deserializeAddress)(constants_1.APP_WALLET_ADDRESS).pubKeyHash;
        const mintCompileCode = this.readValidator(plutus_json_1.default, constants_1.title.mint);
        const storeCompileCode = this.readValidator(plutus_json_1.default, constants_1.title.store);
        this.storeScriptCbor = (0, core_1.applyParamsToScript)(storeCompileCode, [
            this.pubKeyExchange,
            BigInt(1),
            this.pubKeyIssuer,
        ]);
        const storeScript = { code: this.storeScriptCbor, version: 'V3' };
        this.storeAddress = (0, core_1.serializeAddressObj)((0, core_1.scriptAddress)((0, core_1.deserializeAddress)((0, core_1.serializePlutusScript)(storeScript, undefined, constants_1.appNetworkId, false).address).scriptHash, (0, core_1.deserializeAddress)(constants_1.APP_WALLET_ADDRESS).stakeCredentialHash, false), constants_1.appNetworkId);
        const storeScriptHash = (0, core_1.deserializeAddress)(this.storeAddress).scriptHash;
        this.mintScriptCbor = (0, core_1.applyParamsToScript)(mintCompileCode, [
            this.pubKeyExchange,
            BigInt(1),
            storeScriptHash,
            (0, core_1.deserializeAddress)(constants_1.APP_WALLET_ADDRESS).stakeCredentialHash,
            this.pubKeyIssuer,
        ]);
        this.policyId = (0, core_1.resolveScriptHash)(this.mintScriptCbor, 'V3');
    }
    readValidator(plutus, title) {
        const validator = plutus.validators.find((v) => v.title === title);
        if (!validator)
            throw new Error(`${title} validator not found`);
        return validator.compiledCode;
    }
    async getWalletForTx() {
        const utxos = await this.wallet.getUtxos();
        const walletAddress = this.wallet.getChangeAddress();
        if (!utxos || utxos.length === 0)
            throw new Error('No UTXOs found');
        if (!walletAddress)
            throw new Error('No wallet address found');
        let collaterals = await this.wallet.getCollateral();
        if (!collaterals || collaterals.length === 0) {
            const suitableUtxo = utxos.find((utxo) => {
                const hasOnlyLovelace = utxo.output.amount.length === 1 && utxo.output.amount[0].unit === 'lovelace';
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
    async getAddressUTXOAsset(address, unit) {
        const utxos = await this.fetcher.fetchAddressUTxOs(address, unit);
        return utxos[utxos.length - 1];
    }
    async payment({ amount }) {
        const { walletAddress, collateral, utxos } = await this.getWalletForTx();
        const unsignedTx = this.meshTxBuilder
            .txOut(constants_1.APP_WALLET_ADDRESS, [{ unit: 'lovelace', quantity: amount }])
            .changeAddress(walletAddress)
            .requiredSignerHash((0, core_1.deserializeAddress)(walletAddress).pubKeyHash)
            .selectUtxosFrom(utxos)
            .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
            .setNetwork(constants_1.appNetwork);
        return await unsignedTx.complete();
    }
    async mint(params) {
        const { utxos, walletAddress, collateral } = await this.getWalletForTx();
        this.meshTxBuilder = new core_1.MeshTxBuilder({
            fetcher: this.fetcher,
            evaluator: this.blockfrostProvider,
        });
        const unsignedTx = this.meshTxBuilder.mintPlutusScriptV3();
        const txOutReceiverMap = new Map();
        for (const { assetName, metadata, quantity = '1', receiver } of params) {
            const receiverAddress = receiver || walletAddress;
            const existingUtxo = await this.getAddressUTXOAsset(this.storeAddress, this.policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)));
            if (existingUtxo?.output?.plutusData) {
                throw new Error(`Asset "${assetName}" already exists`);
            }
            if (txOutReceiverMap.has(receiverAddress)) {
                txOutReceiverMap.get(receiverAddress).push({
                    unit: this.policyId + (0, core_1.CIP68_222)((0, core_1.stringToHex)(assetName)),
                    quantity,
                });
            }
            else {
                txOutReceiverMap.set(receiverAddress, [
                    { unit: this.policyId + (0, core_1.CIP68_222)((0, core_1.stringToHex)(assetName)), quantity },
                ]);
            }
            unsignedTx
                .mintPlutusScriptV3()
                .mint(quantity, this.policyId, (0, core_1.CIP68_222)((0, core_1.stringToHex)(assetName)))
                .mintingScript(this.mintScriptCbor)
                .mintRedeemerValue((0, core_1.mConStr0)([]))
                .mintPlutusScriptV3()
                .mint('1', this.policyId, (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)))
                .mintingScript(this.mintScriptCbor)
                .mintRedeemerValue((0, core_1.mConStr0)([]))
                .txOut(this.storeAddress, [
                { unit: this.policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)), quantity: '1' },
            ])
                .txOutInlineDatumValue((0, core_1.metadataToCip68)(metadata));
        }
        txOutReceiverMap.forEach((assets, receiver) => {
            unsignedTx.txOut(receiver, assets);
        });
        unsignedTx
            .txOut(constants_1.APP_WALLET_ADDRESS, [{ unit: 'lovelace', quantity: constants_1.EXCHANGE_FEE_PRICE }])
            .changeAddress(walletAddress)
            .requiredSignerHash((0, core_1.deserializeAddress)(walletAddress).pubKeyHash)
            .selectUtxosFrom(utxos)
            .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
            .setNetwork(constants_1.appNetwork);
        return await unsignedTx.complete();
    }
    async burn(params) {
        const { utxos, walletAddress, collateral } = await this.getWalletForTx();
        this.meshTxBuilder = new core_1.MeshTxBuilder({
            fetcher: this.fetcher,
            evaluator: this.blockfrostProvider,
        });
        const unsignedTx = this.meshTxBuilder;
        for (const { assetName, quantity } of params) {
            const storeUtxo = await this.getAddressUTXOAsset(this.storeAddress, this.policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)));
            if (!storeUtxo)
                throw new Error(`Asset "${assetName}" not found`);
            unsignedTx
                .mintPlutusScriptV3()
                .mint(quantity, this.policyId, (0, core_1.CIP68_222)((0, core_1.stringToHex)(assetName)))
                .mintRedeemerValue((0, core_1.mConStr1)([]))
                .mintingScript(this.mintScriptCbor)
                .mintPlutusScriptV3()
                .mint('-1', this.policyId, (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)))
                .mintRedeemerValue((0, core_1.mConStr1)([]))
                .mintingScript(this.mintScriptCbor)
                .spendingPlutusScriptV3()
                .txIn(storeUtxo.input.txHash, storeUtxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue((0, core_1.mConStr1)([]))
                .txInScript(this.storeScriptCbor);
        }
        unsignedTx
            .txOut(constants_1.APP_WALLET_ADDRESS, [{ unit: 'lovelace', quantity: constants_1.EXCHANGE_FEE_PRICE }])
            .changeAddress(walletAddress)
            .requiredSignerHash((0, core_1.deserializeAddress)(walletAddress).pubKeyHash)
            .selectUtxosFrom(utxos)
            .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
            .setNetwork(constants_1.appNetwork);
        return await unsignedTx.complete();
    }
    async update(params) {
        const { utxos, walletAddress, collateral } = await this.getWalletForTx();
        this.meshTxBuilder = new core_1.MeshTxBuilder({
            fetcher: this.fetcher,
            evaluator: this.blockfrostProvider,
        });
        const unsignedTx = this.meshTxBuilder;
        for (const { assetName, metadata } of params) {
            const storeUtxo = await this.getAddressUTXOAsset(this.storeAddress, this.policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)));
            if (!storeUtxo)
                throw new Error(`Asset "${assetName}" not found`);
            unsignedTx
                .spendingPlutusScriptV3()
                .txIn(storeUtxo.input.txHash, storeUtxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue((0, core_1.mConStr0)([]))
                .txInScript(this.storeScriptCbor)
                .txOut(this.storeAddress, [
                { unit: this.policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)), quantity: '1' },
            ])
                .txOutInlineDatumValue((0, core_1.metadataToCip68)(metadata));
        }
        unsignedTx
            .txOut(constants_1.APP_WALLET_ADDRESS, [{ unit: 'lovelace', quantity: constants_1.EXCHANGE_FEE_PRICE }])
            .changeAddress(walletAddress)
            .requiredSignerHash((0, core_1.deserializeAddress)(walletAddress).pubKeyHash)
            .selectUtxosFrom(utxos)
            .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
            .setNetwork(constants_1.appNetwork);
        return await unsignedTx.complete();
    }
}
exports.Cip68Contract = Cip68Contract;
//# sourceMappingURL=cip68.contract.js.map