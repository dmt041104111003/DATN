"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cip68Contract = void 0;
const core_1 = require("@meshsdk/core");
const lodash_1 = require("lodash");
const mesh_adapter_1 = require("./mesh.adapter");
const config_service_1 = require("../config/config.service");
const utils_1 = require("./utils");
const standalone_1 = require("../cardano/standalone");
const CIP68_222 = (tokenNameHex) => `000de140${tokenNameHex}`;
class Cip68Contract extends mesh_adapter_1.MeshAdapter {
    constructor(opts = {}) {
        super(opts);
        this.mint = async (params) => {
            const { utxos, walletAddress, collateral } = await this.getWalletForTx();
            const unsignedTx = this.meshTxBuilder.mintPlutusScriptV3();
            const txOutReceiverMap = new Map();
            await Promise.all(params.map(async ({ assetName, metadata, quantity = "1", receiver = "", }) => {
                var _a;
                if (quantity !== "1") {
                    throw new Error("CIP-68 label 222 requires quantity = 1");
                }
                const existUtXOwithUnit = await this.getAddressUTXOAsset(this.storeAddress, this.policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)));
                if ((_a = existUtXOwithUnit === null || existUtXOwithUnit === void 0 ? void 0 : existUtXOwithUnit.output) === null || _a === void 0 ? void 0 : _a.plutusData) {
                    throw new Error(`Asset name "${assetName}" already minted. Mỗi QR phải dùng asset name duy nhất (ví dụ thêm suffix: ${assetName}-001, ${assetName}-002).`);
                }
                else {
                    const receiverKey = !(0, lodash_1.isEmpty)(receiver) ? receiver : walletAddress;
                    if (txOutReceiverMap.has(receiverKey)) {
                        txOutReceiverMap.get(receiverKey).push({
                            unit: this.policyId + CIP68_222((0, core_1.stringToHex)(assetName)),
                            quantity: quantity,
                        });
                    }
                    else {
                        txOutReceiverMap.set(receiverKey, [
                            {
                                unit: this.policyId + CIP68_222((0, core_1.stringToHex)(assetName)),
                                quantity: quantity,
                            },
                        ]);
                    }
                    unsignedTx
                        .mintPlutusScriptV3()
                        .mint(quantity, this.policyId, CIP68_222((0, core_1.stringToHex)(assetName)))
                        .mintingScript(this.mintScriptCbor)
                        .mintRedeemerValue((0, core_1.mConStr0)([]))
                        .mintPlutusScriptV3()
                        .mint("1", this.policyId, (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)))
                        .mintingScript(this.mintScriptCbor)
                        .mintRedeemerValue((0, core_1.mConStr0)([]))
                        .txOut(this.storeAddress, [
                        {
                            unit: this.policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)),
                            quantity: "1",
                        },
                    ])
                        .txOutInlineDatumValue((0, core_1.metadataToCip68)((0, utils_1.metadataForDatum)(metadata)));
                }
            }));
            txOutReceiverMap.forEach((assets, receiver) => {
                unsignedTx.txOut(receiver, assets);
            });
            unsignedTx
                .changeAddress(walletAddress)
                .requiredSignerHash((0, core_1.deserializeAddress)(walletAddress).pubKeyHash)
                .selectUtxosFrom(utxos, "largestFirst", "7500000", true)
                .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
                .setNetwork(this.appNetwork);
            return await unsignedTx.complete();
        };
        this.burn = async (params) => {
            const { utxos, walletAddress, collateral } = await this.getWalletForTx();
            const unsignedTx = this.meshTxBuilder;
            await Promise.all(params.map(async ({ assetName, quantity, txHash }) => {
                var _a, _b, _c, _d;
                const q = Number(quantity);
                if (!Number.isFinite(q) || Math.abs(q) !== 1) {
                    throw new Error("CIP-68 label 222 burn requires quantity = -1");
                }
                const rftSuffix = CIP68_222((0, core_1.stringToHex)(assetName));
                const policyIdToUse = (_a = (await this.getPolicyIdFromWalletRft(walletAddress, rftSuffix))) !== null && _a !== void 0 ? _a : this.policyId;
                const rftUnit = policyIdToUse + rftSuffix;
                const userUtxos = await this.getAddressUTXOAssets(walletAddress, rftUnit);
                const amount = userUtxos.reduce((sum, u) => sum +
                    u.output.amount.reduce((amt, a) => a.unit === rftUnit ? amt + Number(a.quantity) : amt, 0), 0);
                const ref100Unit = policyIdToUse + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName));
                const storeUtxo = !(0, lodash_1.isNil)(txHash)
                    ? await this.getUtxoForTx(this.storeAddress, txHash)
                    : await this.getUtxoContainingUnit(ref100Unit);
                if (!storeUtxo)
                    throw new Error("Store UTXO not found");
                const datum = (_b = storeUtxo.output) === null || _b === void 0 ? void 0 : _b.plutusData;
                if (datum) {
                    const meta = (await (0, utils_1.datumToJson)(datum, {
                        contain_pk: true,
                    }));
                    const minterPk = (_d = (_c = meta._pk) !== null && _c !== void 0 ? _c : (await (0, utils_1.getPkHash)(datum))) !== null && _d !== void 0 ? _d : "";
                    const walletPk = (0, core_1.deserializeAddress)(walletAddress).pubKeyHash;
                    const receivers = (0, utils_1.decodeReceivers)(meta.receivers);
                    const inChain = walletPk === minterPk ||
                        receivers.some((r) => r.pubKeyHash === walletPk);
                    if (!inChain) {
                        throw new Error("Ví không trong chuỗi (địa chỉ không có trong metadata.receivers). Burn bị từ chối bởi validator.");
                    }
                }
                const mintScriptCborToUse = policyIdToUse !== this.policyId && this.minterMintScriptCbor
                    ? this.minterMintScriptCbor
                    : this.mintScriptCbor;
                const burnQuantity = q > 0 ? -q : q;
                const burnQuantityStr = String(burnQuantity);
                const remainingAmount = amount + burnQuantity;
                unsignedTx.readOnlyTxInReference(storeUtxo.input.txHash, storeUtxo.input.outputIndex);
                unsignedTx
                    .mintPlutusScriptV3()
                    .mint(burnQuantityStr, policyIdToUse, CIP68_222((0, core_1.stringToHex)(assetName)))
                    .mintRedeemerValue((0, core_1.mConStr1)([]))
                    .mintingScript(mintScriptCborToUse);
                if (remainingAmount > 0) {
                    unsignedTx.txOut(walletAddress, [
                        {
                            unit: rftUnit,
                            quantity: String(remainingAmount),
                        },
                    ]);
                }
            }));
            unsignedTx
                .requiredSignerHash((0, core_1.deserializeAddress)(walletAddress).pubKeyHash)
                .changeAddress(walletAddress)
                .selectUtxosFrom(utxos)
                .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
                .setNetwork(this.appNetwork);
            return await unsignedTx.complete();
        };
        this.update = async (params) => {
            const { utxos, walletAddress, collateral } = await this.getWalletForTx();
            const unsignedTx = this.meshTxBuilder;
            await Promise.all(params.map(async ({ assetName, metadata, txHash }) => {
                const storeUtxo = !(0, lodash_1.isNil)(txHash)
                    ? await this.getUtxoForTx(this.storeAddress, txHash)
                    : await this.getAddressUTXOAsset(this.storeAddress, this.policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)));
                if (!storeUtxo)
                    throw new Error("Store UTXO not found");
                unsignedTx
                    .spendingPlutusScriptV3()
                    .txIn(storeUtxo.input.txHash, storeUtxo.input.outputIndex)
                    .txInInlineDatumPresent()
                    .txInRedeemerValue((0, core_1.mConStr0)([]))
                    .txInScript(this.storeScriptCbor)
                    .txOut(this.storeAddress, [
                    {
                        unit: this.policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)),
                        quantity: "1",
                    },
                ])
                    .txOutInlineDatumValue((0, core_1.metadataToCip68)((0, utils_1.metadataForDatum)(metadata)));
            }));
            unsignedTx
                .requiredSignerHash((0, core_1.deserializeAddress)(walletAddress).pubKeyHash)
                .changeAddress(walletAddress)
                .selectUtxosFrom(utxos)
                .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
                .setNetwork(this.appNetwork);
            return await unsignedTx.complete();
        };
        this.revoke = async (params) => {
            const { utxos, walletAddress, collateral } = await this.getWalletForTx();
            const unsignedTx = this.meshTxBuilder;
            for (const { assetName, txHash } of params) {
                const storeUtxo = !(0, lodash_1.isNil)(txHash)
                    ? await this.getUtxoForTx(this.storeAddress, txHash)
                    : await this.getAddressUTXOAsset(this.storeAddress, this.policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)));
                if (!storeUtxo)
                    throw new Error(`Store UTXO not found for ${assetName}`);
                unsignedTx
                    .spendingPlutusScriptV3()
                    .txIn(storeUtxo.input.txHash, storeUtxo.input.outputIndex)
                    .txInInlineDatumPresent()
                    .txInRedeemerValue((0, core_1.mConStr1)([]))
                    .txInScript(this.storeScriptCbor)
                    .mintPlutusScriptV3()
                    .mint("-1", this.policyId, (0, core_1.CIP68_100)((0, core_1.stringToHex)(assetName)))
                    .mintRedeemerValue((0, core_1.mConStr2)([]))
                    .mintingScript(this.mintScriptCbor);
            }
            unsignedTx
                .requiredSignerHash((0, core_1.deserializeAddress)(walletAddress).pubKeyHash)
                .changeAddress(walletAddress)
                .selectUtxosFrom(utxos)
                .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
                .setNetwork(this.appNetwork);
            return await unsignedTx.complete();
        };
        this.createReferenceScriptMint = async (MINT_REFERENCE_SCRIPT_ADDRESS) => {
            const { walletAddress, utxos, collateral } = await this.getWalletForTx();
            const unsignedTx = this.meshTxBuilder
                .txIn(collateral.input.txHash, collateral.input.outputIndex)
                .txOut(MINT_REFERENCE_SCRIPT_ADDRESS, [
                { unit: "lovelace", quantity: "20000000" },
            ])
                .txOutReferenceScript(this.mintScriptCbor, "V3")
                .txOutDatumHashValue("")
                .changeAddress(walletAddress)
                .selectUtxosFrom(utxos)
                .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address);
            return await unsignedTx.complete();
        };
        this.createReferenceScriptStore = async (STORE_REFERENCE_SCRIPT_ADDRESS) => {
            const { walletAddress, utxos, collateral } = await this.getWalletForTx();
            const unsignedTx = this.meshTxBuilder
                .txIn(collateral.input.txHash, collateral.input.outputIndex)
                .txOut(STORE_REFERENCE_SCRIPT_ADDRESS, [
                { unit: "lovelace", quantity: "20000000" },
            ])
                .txOutReferenceScript(this.storeScriptCbor, "V3")
                .txOutDatumHashValue("")
                .changeAddress(walletAddress)
                .selectUtxosFrom(utxos)
                .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address);
            return await unsignedTx.complete();
        };
        this.getRftSupply = async (assetName, policyId) => {
            var _a;
            const policyIdToUse = policyId !== null && policyId !== void 0 ? policyId : this.policyId;
            const rftUnit = policyIdToUse + CIP68_222((0, core_1.stringToHex)(assetName));
            try {
                const assetInfo = (await standalone_1.blockfrostFetcher.fetchSpecificAsset(rftUnit));
                return (_a = assetInfo === null || assetInfo === void 0 ? void 0 : assetInfo.quantity) !== null && _a !== void 0 ? _a : "0";
            }
            catch (_b) {
                return "0";
            }
        };
        this.getRftBalanceAtAddress = async (address, assetName, policyId) => {
            const policyIdToUse = policyId !== null && policyId !== void 0 ? policyId : this.policyId;
            const rftUnit = policyIdToUse + CIP68_222((0, core_1.stringToHex)(assetName));
            const utxos = await this.getAddressUTXOAssets(address, rftUnit);
            return utxos.reduce((sum, u) => sum +
                u.output.amount.reduce((amt, a) => (a.unit === rftUnit ? amt + Number(a.quantity) : amt), 0), 0);
        };
        this.getRftDistribution = async (assetName, inChainAddresses, policyId) => {
            var _a;
            const policyIdToUse = policyId !== null && policyId !== void 0 ? policyId : this.policyId;
            const rftUnit = policyIdToUse + CIP68_222((0, core_1.stringToHex)(assetName));
            const inChainSet = new Set(inChainAddresses.map((a) => a.toLowerCase()));
            const inChainMap = new Map();
            const offChainMap = new Map();
            const txList = await standalone_1.blockfrostFetcher.fetchAllAssetTransactions(rftUnit);
            const allAddresses = new Set();
            for (const txHash of txList.map((t) => t.tx_hash)) {
                try {
                    const tx = await standalone_1.blockfrostFetcher.fetchTransactionsUTxO(txHash);
                    for (const output of tx.outputs || []) {
                        const hasRft = (_a = output.amount) === null || _a === void 0 ? void 0 : _a.some((a) => a.unit === rftUnit);
                        if (hasRft && output.address) {
                            allAddresses.add(output.address);
                        }
                    }
                }
                catch (_b) {
                }
            }
            for (const address of allAddresses) {
                const balance = await this.getRftBalanceAtAddress(address, assetName, policyIdToUse);
                if (balance > 0) {
                    if (inChainSet.has(address.toLowerCase())) {
                        inChainMap.set(address, balance);
                    }
                    else {
                        offChainMap.set(address, balance);
                    }
                }
            }
            const totalInChain = Array.from(inChainMap.values()).reduce((sum, b) => sum + b, 0);
            const totalOffChain = Array.from(offChainMap.values()).reduce((sum, b) => sum + b, 0);
            const totalSupply = await this.getRftSupply(assetName, policyIdToUse);
            return {
                inChain: inChainMap,
                offChain: offChainMap,
                totalInChain,
                totalOffChain,
                totalSupply,
            };
        };
    }
    get appNetwork() {
        return new config_service_1.ConfigService().appNetwork;
    }
}
exports.Cip68Contract = Cip68Contract;
//# sourceMappingURL=cip68.contract.js.map