"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TxBuilderHelper = void 0;
const core_1 = require("@meshsdk/core");
class TxBuilderHelper {
    constructor(blockfrostProvider, plutusHelper) {
        this.blockfrostProvider = blockfrostProvider;
        this.plutusHelper = plutusHelper;
        const network = process.env.APP_NETWORK || 'preprod';
        this.appNetworkId = network === 'mainnet' ? 1 : 0;
    }
    newTxBuilder() {
        return new core_1.MeshTxBuilder({
            fetcher: this.blockfrostProvider,
            evaluator: this.blockfrostProvider,
        });
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
            throw new Error('Insufficient settlement capacity on this custodian account.');
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
            throw new Error('Add a small, spendable balance on this custodian account so record fees can be covered, then try again.');
        }
        const { policyId, contractAddress, mintScriptCbor } = this.plutusHelper.getScripts(owners);
        const unsignedTx = this.newTxBuilder();
        unsignedTx.txIn(feePayerUtxo.input.txHash, feePayerUtxo.input.outputIndex, feePayerUtxo.output.amount, feePayerUtxo.output.address);
        for (const { productName, metadata, quantity = '1', receiver } of products) {
            const existingUtxo = await this.getAddressUTXOAsset(contractAddress, policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(productName)));
            if (existingUtxo) {
                throw new Error(`A registration already exists for agri lot "${productName}".`);
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
        return await unsignedTx.complete();
    }
    async buildUpdateTx(walletAddress, owners, products) {
        const utxos = await this.getUtxosForAddress(walletAddress);
        const collaterals = await this.getCollateralForAddress(walletAddress);
        if (utxos.length === 0 || collaterals.length === 0) {
            throw new Error('Insufficient settlement capacity on this custodian account.');
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
            throw new Error('Add a small, spendable balance on this custodian account so the refresh fees can be covered, then try again.');
        }
        const { policyId, contractAddress, spendScriptCbor } = this.plutusHelper.getScripts(owners);
        const unsignedTx = this.newTxBuilder();
        unsignedTx.txIn(feePayerUtxo.input.txHash, feePayerUtxo.input.outputIndex, feePayerUtxo.output.amount, feePayerUtxo.output.address);
        for (const { productName, metadata } of products) {
            const referenceUnit = policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(productName));
            const referenceUtxos = await this.blockfrostProvider.fetchAddressUTxOs(contractAddress, referenceUnit);
            const referenceUtxo = referenceUtxos.length > 0 ? referenceUtxos[referenceUtxos.length - 1] : null;
            if (!referenceUtxo) {
                const ownersRaw = owners.map((x) => String(x || '').trim()).filter(Boolean).join(',');
                throw new Error(`Vault deposit not found. productName=${productName}; policyId=${policyId}; contractAddress=${contractAddress}; referenceUnit=${referenceUnit}; owners=${ownersRaw}; utxoCount=${referenceUtxos.length}`);
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
        return await unsignedTx.complete();
    }
    async buildBurnTx(walletAddress, owners, products) {
        const utxos = await this.getUtxosForAddress(walletAddress);
        const collaterals = await this.getCollateralForAddress(walletAddress);
        if (utxos.length === 0 || collaterals.length === 0) {
            throw new Error('Insufficient settlement capacity on this custodian account.');
        }
        const collateral = collaterals[0];
        const { policyId, contractAddress, mintScriptCbor, spendScriptCbor } = this.plutusHelper.getScripts(owners);
        const unsignedTx = this.newTxBuilder();
        for (const { productName } of products) {
            const userUnit = policyId + (0, core_1.CIP68_222)((0, core_1.stringToHex)(productName));
            const referenceUnit = policyId + (0, core_1.CIP68_100)((0, core_1.stringToHex)(productName));
            const userUtxos = await this.blockfrostProvider.fetchAddressUTxOs(walletAddress, userUnit);
            const referenceUtxo = await this.getAddressUTXOAsset(contractAddress, referenceUnit);
            if (!referenceUtxo) {
                throw new Error(`Vault deposit for agri lot "${productName}" was not found.`);
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
        return await unsignedTx.complete();
    }
}
exports.TxBuilderHelper = TxBuilderHelper;
//# sourceMappingURL=tx-builder.helper.js.map