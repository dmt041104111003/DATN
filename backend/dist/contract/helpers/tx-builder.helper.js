"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TxBuilderHelper = void 0;
const core_1 = require("@meshsdk/core");
const protocol_params_helper_1 = require("./protocol-params.helper");
const fix_script_data_hash_helper_1 = require("./fix-script-data-hash.helper");
class TxBuilderHelper {
    constructor(blockfrostProvider, plutusHelper, blockfrostApiKey) {
        this.blockfrostProvider = blockfrostProvider;
        this.plutusHelper = plutusHelper;
        this.blockfrostApiKey = blockfrostApiKey;
        const network = process.env.APP_NETWORK || 'preprod';
        this.appNetwork = network === 'mainnet' ? 'mainnet' : 'preprod';
        this.appNetworkId = this.appNetwork === 'mainnet' ? 1 : 0;
    }
    async newTxBuilder() {
        const builder = new core_1.MeshTxBuilder({
            fetcher: this.blockfrostProvider,
            evaluator: this.blockfrostProvider,
        });
        const params = await this.blockfrostProvider.fetchProtocolParameters();
        builder.protocolParams(params);
        return builder;
    }
    getCostmdls() {
        if (!this.costmdlsPromise) {
            this.costmdlsPromise = (0, protocol_params_helper_1.fetchOnChainCostmdls)(this.blockfrostApiKey, this.appNetwork);
        }
        return this.costmdlsPromise;
    }
    async completeTx(builder) {
        const txHex = await builder.complete();
        const costmdls = await this.getCostmdls();
        return (0, fix_script_data_hash_helper_1.fixScriptDataHashInTx)(txHex, costmdls);
    }
    async getUtxosForAddress(address) {
        return await this.blockfrostProvider.fetchAddressUTxOs(address);
    }
    async getCollateralForAddress(address) {
        const utxos = await this.getUtxosForAddress(address);
        return utxos.filter((utxo) => {
            const lovelace = utxo.output.amount.find((a) => a.unit === 'lovelace');
            const hasOnlyLovelace = utxo.output.amount.length === 1 && lovelace !== undefined;
            return hasOnlyLovelace && lovelace && BigInt(lovelace.quantity) >= BigInt(5000000);
        });
    }
    async getAddressUTXOAsset(address, unit) {
        const utxos = await this.blockfrostProvider.fetchAddressUTxOs(address, unit);
        return utxos.length > 0 ? utxos[utxos.length - 1] : null;
    }
    async buildMintTx(walletAddress, owners, products) {
        const utxos = await this.getUtxosForAddress(walletAddress);
        const collaterals = await this.getCollateralForAddress(walletAddress);
        if (utxos.length === 0 || collaterals.length === 0) {
            throw new Error('Ví custodian không đủ UTxO hoặc collateral để thực hiện giao dịch.');
        }
        const collateral = collaterals[0];
        const collateralId = `${collateral.input.txHash}#${collateral.input.outputIndex}`;
        const spendableUtxos = utxos.filter((u) => `${u.input.txHash}#${u.input.outputIndex}` !== collateralId);
        const feePayerUtxo = spendableUtxos
            .map((u) => {
            const lovelace = u.output.amount.find((a) => a.unit === 'lovelace');
            const qty = lovelace ? BigInt(lovelace.quantity) : BigInt(0);
            return { u, qty };
        })
            .filter(({ qty }) => qty >= BigInt(2_000_000))
            .sort((a, b) => (a.qty > b.qty ? -1 : a.qty < b.qty ? 1 : 0))[0]?.u ?? null;
        if (!feePayerUtxo) {
            throw new Error('Nạp thêm ADA khả dụng vào ví custodian để trả phí giao dịch, rồi thử lại.');
        }
        const { policyId, contractAddress, mintScriptCbor } = this.plutusHelper.getScripts(owners);
        const unsignedTx = await this.newTxBuilder();
        unsignedTx.txIn(feePayerUtxo.input.txHash, feePayerUtxo.input.outputIndex, feePayerUtxo.output.amount, feePayerUtxo.output.address);
        for (const { productName, metadata, quantity = '1', receiver } of products) {
            const existingUtxo = await this.getAddressUTXOAsset(contractAddress, policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(productName)));
            if (existingUtxo) {
                throw new Error(`Lô hàng "${productName}" đã được đăng ký trên chuỗi.`);
            }
            unsignedTx
                .mintPlutusScriptV3()
                .mint(quantity, policyId, (0, core_1.CIP68_222)((0, core_1.stringToHex)(productName)))
                .mintingScript(mintScriptCbor)
                .mintRedeemerValue((0, core_1.mConStr0)([]))
                .mintPlutusScriptV3()
                .mint('1', policyId, (0, core_1.CIP68_100)((0, core_1.stringToHex)(productName)))
                .mintingScript(mintScriptCbor)
                .mintRedeemerValue((0, core_1.mConStr0)([]))
                .txOut(contractAddress, [{ unit: policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(productName)), quantity: '1' }])
                .txOutInlineDatumValue((0, core_1.metadataToCip68)(metadata))
                .txOut(receiver || walletAddress, [{ unit: policyId + (0, core_1.CIP68_222)((0, core_1.stringToHex)(productName)), quantity }]);
        }
        unsignedTx
            .requiredSignerHash((0, core_1.deserializeAddress)(walletAddress).pubKeyHash)
            .changeAddress(walletAddress)
            .selectUtxosFrom(spendableUtxos)
            .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
            .setNetwork(this.appNetworkId === 1 ? 'mainnet' : 'preprod');
        return await this.completeTx(unsignedTx);
    }
    async buildUpdateTx(walletAddress, owners, products) {
        const utxos = await this.getUtxosForAddress(walletAddress);
        const collaterals = await this.getCollateralForAddress(walletAddress);
        if (utxos.length === 0 || collaterals.length === 0) {
            throw new Error('Ví custodian không đủ UTxO hoặc collateral để thực hiện giao dịch.');
        }
        const collateral = collaterals[0];
        const collateralId = `${collateral.input.txHash}#${collateral.input.outputIndex}`;
        const feePayerUtxo = utxos
            .filter((u) => `${u.input.txHash}#${u.input.outputIndex}` !== collateralId)
            .map((u) => {
            const lovelace = u.output.amount.find((a) => a.unit === 'lovelace');
            const qty = lovelace ? BigInt(lovelace.quantity) : BigInt(0);
            return { u, qty };
        })
            .filter(({ qty }) => qty >= BigInt(2_000_000))
            .sort((a, b) => (a.qty > b.qty ? -1 : a.qty < b.qty ? 1 : 0))[0]?.u ?? null;
        if (!feePayerUtxo) {
            throw new Error('Nạp thêm ADA khả dụng vào ví custodian để trả phí cập nhật, rồi thử lại.');
        }
        const { policyId, contractAddress, spendScriptCbor } = this.plutusHelper.getScripts(owners);
        const unsignedTx = await this.newTxBuilder();
        unsignedTx.txIn(feePayerUtxo.input.txHash, feePayerUtxo.input.outputIndex, feePayerUtxo.output.amount, feePayerUtxo.output.address);
        for (const { productName, metadata } of products) {
            const referenceUnit = policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(productName));
            const referenceUtxos = await this.blockfrostProvider.fetchAddressUTxOs(contractAddress, referenceUnit);
            const referenceUtxo = referenceUtxos.length > 0 ? referenceUtxos[referenceUtxos.length - 1] : null;
            if (!referenceUtxo) {
                const ownersRaw = owners.map((x) => String(x || '').trim()).filter(Boolean).join(',');
                throw new Error(`Không tìm thấy UTxO tham chiếu trên vault. Lô: ${productName}; policyId=${policyId}; contract=${contractAddress}; owners=${ownersRaw}`);
            }
            unsignedTx
                .spendingPlutusScriptV3()
                .txIn(referenceUtxo.input.txHash, referenceUtxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue((0, core_1.mConStr0)([]))
                .txInScript(spendScriptCbor)
                .txOut(contractAddress, [{ unit: referenceUnit, quantity: '1' }])
                .txOutInlineDatumValue((0, core_1.metadataToCip68)(metadata));
        }
        unsignedTx
            .requiredSignerHash((0, core_1.deserializeAddress)(walletAddress).pubKeyHash)
            .changeAddress(walletAddress)
            .selectUtxosFrom(utxos)
            .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
            .setNetwork(this.appNetworkId === 1 ? 'mainnet' : 'preprod');
        return await this.completeTx(unsignedTx);
    }
    async buildBurnTx(walletAddress, owners, products) {
        const utxos = await this.getUtxosForAddress(walletAddress);
        const collaterals = await this.getCollateralForAddress(walletAddress);
        if (utxos.length === 0 || collaterals.length === 0) {
            throw new Error('Ví custodian không đủ UTxO hoặc collateral để thực hiện giao dịch.');
        }
        const collateral = collaterals[0];
        const { policyId, contractAddress, mintScriptCbor, spendScriptCbor } = this.plutusHelper.getScripts(owners);
        const unsignedTx = await this.newTxBuilder();
        for (const { productName } of products) {
            const userUnit = policyId + (0, core_1.CIP68_222)((0, core_1.stringToHex)(productName));
            const referenceUnit = policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(productName));
            const userUtxos = await this.blockfrostProvider.fetchAddressUTxOs(walletAddress, userUnit);
            const referenceUtxo = await this.getAddressUTXOAsset(contractAddress, referenceUnit);
            if (!referenceUtxo) {
                throw new Error(`Không tìm thấy deposit vault cho lô "${productName}".`);
            }
            const amount = userUtxos
                .flatMap((u) => u.output.amount)
                .filter((a) => a.unit === userUnit)
                .reduce((sum, a) => sum + Number(a.quantity), 0);
            if (amount) {
                unsignedTx
                    .mintPlutusScriptV3()
                    .mint(`-${amount}`, policyId, (0, core_1.CIP68_222)((0, core_1.stringToHex)(productName)))
                    .mintRedeemerValue((0, core_1.mConStr1)([]))
                    .mintingScript(mintScriptCbor);
            }
            unsignedTx
                .mintPlutusScriptV3()
                .mint('-1', policyId, (0, core_1.CIP68_100)((0, core_1.stringToHex)(productName)))
                .mintRedeemerValue((0, core_1.mConStr1)([]))
                .mintingScript(mintScriptCbor)
                .spendingPlutusScriptV3()
                .txIn(referenceUtxo.input.txHash, referenceUtxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue((0, core_1.mConStr1)([]))
                .txInScript(spendScriptCbor);
        }
        unsignedTx
            .requiredSignerHash((0, core_1.deserializeAddress)(walletAddress).pubKeyHash)
            .changeAddress(walletAddress)
            .selectUtxosFrom(utxos)
            .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
            .setNetwork(this.appNetworkId === 1 ? 'mainnet' : 'preprod');
        return await this.completeTx(unsignedTx);
    }
}
exports.TxBuilderHelper = TxBuilderHelper;
//# sourceMappingURL=tx-builder.helper.js.map