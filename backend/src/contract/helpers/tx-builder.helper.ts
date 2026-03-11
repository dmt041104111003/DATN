import {
  MeshTxBuilder,
  BlockfrostProvider,
  deserializeAddress,
  CIP68_100,
  CIP68_222,
  stringToHex,
  metadataToCip68,
  mConStr0,
  mConStr1,
  type UTxO,
} from '@meshsdk/core';
import { PlutusHelper } from './plutus.helper';

export class TxBuilderHelper {
  private blockfrostProvider: BlockfrostProvider;
  private plutusHelper: PlutusHelper;
  private readonly appNetworkId: number;

  constructor(
    blockfrostProvider: BlockfrostProvider,
    plutusHelper: PlutusHelper,
  ) {
    this.blockfrostProvider = blockfrostProvider;
    this.plutusHelper = plutusHelper;
    const network = process.env.APP_NETWORK || 'preprod';
    this.appNetworkId = network === 'mainnet' ? 1 : 0;
  }

  private newTxBuilder(): MeshTxBuilder {
    return new MeshTxBuilder({
      fetcher: this.blockfrostProvider,
      evaluator: this.blockfrostProvider,
    });
  }

  async getUtxosForAddress(address: string): Promise<UTxO[]> {
    return await this.blockfrostProvider.fetchAddressUTxOs(address);
  }

  async getCollateralForAddress(address: string): Promise<UTxO[]> {
    const utxos = await this.getUtxosForAddress(address);
    return utxos.filter((utxo) => {
      const lovelace = utxo.output.amount.find((a) => a.unit === 'lovelace');
      const hasOnlyLovelace =
        utxo.output.amount.length === 1 && lovelace !== undefined;
      return (
        hasOnlyLovelace &&
        lovelace &&
        BigInt(lovelace.quantity) >= BigInt(5000000)
      );
    });
  }

  async getAddressUTXOAsset(
    address: string,
    unit: string,
  ): Promise<UTxO | null> {
    const utxos = await this.blockfrostProvider.fetchAddressUTxOs(
      address,
      unit,
    );
    return utxos.length > 0 ? utxos[utxos.length - 1] : null;
  }

  async getAddressUTXOAssets(address: string, unit: string): Promise<UTxO[]> {
    return await this.blockfrostProvider.fetchAddressUTxOs(address, unit);
  }

  async buildMintTx(
    walletAddress: string,
    owners: string[],
    assets: Array<{
      assetName: string;
      metadata: Record<string, string>;
      quantity?: string;
      receiver?: string;
    }>,
  ): Promise<string> {
    const utxos = await this.getUtxosForAddress(walletAddress);
    const collaterals = await this.getCollateralForAddress(walletAddress);

    if (utxos.length === 0) {
      throw new Error('No UTXOs found for wallet address');
    }
    if (collaterals.length === 0) {
      throw new Error('No collateral found for wallet address');
    }

    const collateral = collaterals[0];
    const { policyId, contractAddress, mintScriptCbor } =
      this.plutusHelper.getScripts(owners);

    const unsignedTx = this.newTxBuilder();

    for (const { assetName, metadata, quantity = '1', receiver } of assets) {
      const existingUtxo = await this.getAddressUTXOAsset(
        contractAddress,
        policyId + CIP68_100(stringToHex(assetName)),
      );

      if (existingUtxo) {
        throw new Error(`Asset "${assetName}" has already been minted`);
      }

      unsignedTx
        .mintPlutusScriptV3()
        .mint(quantity, policyId, CIP68_222(stringToHex(assetName)))
        .mintingScript(mintScriptCbor)
        .mintRedeemerValue(mConStr0([]))

        .mintPlutusScriptV3()
        .mint('1', policyId, CIP68_100(stringToHex(assetName)))
        .mintingScript(mintScriptCbor)
        .mintRedeemerValue(mConStr0([]))

        .txOut(contractAddress, [
          {
            unit: policyId + CIP68_100(stringToHex(assetName)),
            quantity: '1',
          },
        ])
        .txOutInlineDatumValue(metadataToCip68(metadata))

        .txOut(receiver || walletAddress, [
          {
            unit: policyId + CIP68_222(stringToHex(assetName)),
            quantity: quantity,
          },
        ]);
    }

    unsignedTx
      .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
      .changeAddress(walletAddress)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
      )
      .setNetwork(this.appNetworkId === 1 ? 'mainnet' : 'preprod');

    return await unsignedTx.complete();
  }

  async buildUpdateTx(
    walletAddress: string,
    owners: string[],
    assets: Array<{
      assetName: string;
      metadata: Record<string, string>;
    }>,
  ): Promise<string> {
    const utxos = await this.getUtxosForAddress(walletAddress);
    const collaterals = await this.getCollateralForAddress(walletAddress);

    if (utxos.length === 0 || collaterals.length === 0) {
      throw new Error('Insufficient UTXOs or collateral');
    }

    const collateral = collaterals[0];
    const { policyId, contractAddress, spendScriptCbor } =
      this.plutusHelper.getScripts(owners);

    const unsignedTx = this.newTxBuilder();

    for (const { assetName, metadata } of assets) {
      const referenceUnit = policyId + CIP68_100(stringToHex(assetName));
      const referenceUtxo = await this.getAddressUTXOAsset(
        contractAddress,
        referenceUnit,
      );

      if (!referenceUtxo) {
        throw new Error(`Reference UTxO not found for "${assetName}"`);
      }

      unsignedTx
        .spendingPlutusScriptV3()
        .txIn(referenceUtxo.input.txHash, referenceUtxo.input.outputIndex)
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr0([]))
        .txInScript(spendScriptCbor)
        .txOut(contractAddress, [
          {
            unit: referenceUnit,
            quantity: '1',
          },
        ])
        .txOutInlineDatumValue(metadataToCip68(metadata));
    }

    unsignedTx
      .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
      .changeAddress(walletAddress)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
      )
      .setNetwork(this.appNetworkId === 1 ? 'mainnet' : 'preprod');

    return await unsignedTx.complete();
  }

  async buildBurnTx(
    walletAddress: string,
    owners: string[],
    assets: Array<{ assetName: string }>,
  ): Promise<string> {
    const utxos = await this.getUtxosForAddress(walletAddress);
    const collaterals = await this.getCollateralForAddress(walletAddress);

    if (utxos.length === 0 || collaterals.length === 0) {
      throw new Error('Insufficient UTXOs or collateral');
    }

    const collateral = collaterals[0];
    const { policyId, contractAddress, mintScriptCbor, spendScriptCbor } =
      this.plutusHelper.getScripts(owners);

    const unsignedTx = this.newTxBuilder();

    for (const { assetName } of assets) {
      const userUnit = policyId + CIP68_222(stringToHex(assetName));
      const referenceUnit = policyId + CIP68_100(stringToHex(assetName));

      const userUtxos = await this.getAddressUTXOAssets(
        walletAddress,
        userUnit,
      );
      const referenceUtxo = await this.getAddressUTXOAsset(
        contractAddress,
        referenceUnit,
      );

      if (!referenceUtxo) {
        throw new Error(`Reference UTxO not found for "${assetName}"`);
      }

      const amount = userUtxos
        .flatMap((u) => u.output.amount)
        .filter((a) => a.unit === userUnit)
        .reduce((sum, a) => sum + Number(a.quantity), 0);

      if (amount) {
        unsignedTx
          .mintPlutusScriptV3()
          .mint(`-${amount}`, policyId, CIP68_222(stringToHex(assetName)))
          .mintRedeemerValue(mConStr1([]))
          .mintingScript(mintScriptCbor);
      }

      unsignedTx
        .mintPlutusScriptV3()
        .mint('-1', policyId, CIP68_100(stringToHex(assetName)))
        .mintRedeemerValue(mConStr1([]))
        .mintingScript(mintScriptCbor)

        .spendingPlutusScriptV3()
        .txIn(referenceUtxo.input.txHash, referenceUtxo.input.outputIndex)
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr1([]))
        .txInScript(spendScriptCbor);
    }

    unsignedTx
      .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
      .changeAddress(walletAddress)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
      )
      .setNetwork(this.appNetworkId === 1 ? 'mainnet' : 'preprod');

    return await unsignedTx.complete();
  }

  /**
   * Retire (burn) ONLY the CIP-68 user token (222) held by the wallet.
   * This must NOT touch the reference token (100) stored at the script address.
   */
  async buildRetire222Tx(
    walletAddress: string,
    owners: string[],
    assets: Array<{ assetName: string }>,
  ): Promise<string> {
    const utxos = await this.getUtxosForAddress(walletAddress);
    const collaterals = await this.getCollateralForAddress(walletAddress);

    if (utxos.length === 0 || collaterals.length === 0) {
      throw new Error('Insufficient UTXOs or collateral');
    }

    const collateral = collaterals[0];
    const { policyId, mintScriptCbor } = this.plutusHelper.getScripts(owners);

    const unsignedTx = this.newTxBuilder();

    for (const { assetName } of assets) {
      const userUnit = policyId + CIP68_222(stringToHex(assetName));
      const userUtxos = await this.getAddressUTXOAssets(walletAddress, userUnit);
      const amount = userUtxos
        .flatMap((u) => u.output.amount)
        .filter((a) => a.unit === userUnit)
        .reduce((sum, a) => sum + Number(a.quantity), 0);

      if (!amount) {
        throw new Error(`Wallet does not hold this NFT (222) for "${assetName}"`);
      }

      unsignedTx
        .mintPlutusScriptV3()
        .mint(`-${amount}`, policyId, CIP68_222(stringToHex(assetName)))
        .mintRedeemerValue(mConStr1([]))
        .mintingScript(mintScriptCbor);
    }

    unsignedTx
      .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
      .changeAddress(walletAddress)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
      )
      .setNetwork(this.appNetworkId === 1 ? 'mainnet' : 'preprod');

    return await unsignedTx.complete();
  }

  /**
   * Build a simple transfer tx that sends the CIP-68 user token (222) to a receiver.
   * This does not touch the reference token (100) stored at the script address.
   */
  async buildTransferTx(
    walletAddress: string,
    receiver: string,
    policyId: string,
    assetName: string,
    quantity: string = '1',
  ): Promise<string> {
    const from = (walletAddress || '').trim();
    const to = (receiver || '').trim();
    const pid = (policyId || '').trim();
    const name = (assetName || '').trim();
    if (!from || !to || !pid || !name) {
      throw new Error('walletAddress, receiver, policyId, and assetName are required');
    }

    const userUnit = pid + CIP68_222(stringToHex(name));
    const hasUtxos = await this.getAddressUTXOAssets(from, userUnit);
    if (hasUtxos.length === 0) {
      throw new Error('Wallet does not hold this NFT');
    }

    const utxos = await this.getUtxosForAddress(from);
    if (utxos.length === 0) {
      throw new Error('No UTXOs found for wallet address');
    }

    const unsignedTx = this.newTxBuilder();
    unsignedTx.txOut(to, [{ unit: userUnit, quantity }]);

    unsignedTx
      .requiredSignerHash(deserializeAddress(from).pubKeyHash)
      .changeAddress(from)
      .selectUtxosFrom(utxos)
      .setNetwork(this.appNetworkId === 1 ? 'mainnet' : 'preprod');

    return await unsignedTx.complete();
  }
}
