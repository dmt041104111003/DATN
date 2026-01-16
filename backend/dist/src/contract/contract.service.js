"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@meshsdk/core");
const mesh_adapter_1 = require("./mesh.adapter");
const constants_1 = require("./constants");
let ContractService = class ContractService extends mesh_adapter_1.MeshAdapter {
    async onModuleInit() {
        await this.init();
        console.log('ContractService initialized, policyId:', this.policyId);
    }
    async mint(params) {
        console.log('Mint params:', JSON.stringify(params, null, 2));
        await this.init();
        const { utxos, walletAddress, collateral } = await this.getWalletForTx();
        this.meshTxBuilder = this.createMeshTxBuilder();
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
        const completedTx = await unsignedTx.complete();
        const txHash = await this.signAndSubmit(completedTx);
        return { txHash };
    }
    async burn(params) {
        await this.init();
        const { utxos, walletAddress, collateral } = await this.getWalletForTx();
        this.meshTxBuilder = this.createMeshTxBuilder();
        const unsignedTx = this.meshTxBuilder;
        for (const { assetName, quantity } of params) {
            const storeUtxo = await this.getAddressUTXOAsset(this.storeAddress, this.policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)));
            if (!storeUtxo) {
                throw new Error(`Asset "${assetName}" not found`);
            }
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
        const completedTx = await unsignedTx.complete();
        const txHash = await this.signAndSubmit(completedTx);
        return { txHash };
    }
    async update(params) {
        await this.init();
        const { utxos, walletAddress, collateral } = await this.getWalletForTx();
        this.meshTxBuilder = this.createMeshTxBuilder();
        const unsignedTx = this.meshTxBuilder;
        for (const { assetName, metadata } of params) {
            const storeUtxo = await this.getAddressUTXOAsset(this.storeAddress, this.policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)));
            if (!storeUtxo) {
                throw new Error(`Asset "${assetName}" not found`);
            }
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
        const completedTx = await unsignedTx.complete();
        const txHash = await this.signAndSubmit(completedTx);
        return { txHash };
    }
    async getInfo() {
        await this.init();
        return {
            policyId: this.policyId,
            storeAddress: this.storeAddress,
        };
    }
};
exports.ContractService = ContractService;
exports.ContractService = ContractService = __decorate([
    (0, common_1.Injectable)()
], ContractService);
//# sourceMappingURL=contract.service.js.map