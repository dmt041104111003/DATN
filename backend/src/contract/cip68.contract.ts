import {
  applyParamsToScript,
  deserializeAddress,
  MeshTxBuilder,
  MeshWallet,
  resolveScriptHash,
  scriptAddress,
  serializeAddressObj,
  serializePlutusScript,
  BlockfrostProvider,
  CIP68_222,
  CIP68_100,
  stringToHex,
  mConStr0,
  mConStr1,
  metadataToCip68,
} from '@meshsdk/core';
import type { PlutusScript, IFetcher } from '@meshsdk/core';
import type { Plutus } from './types';
import {
  APP_WALLET_ADDRESS,
  BLOCKFROST_API_KEY,
  EXCHANGE_FEE_PRICE,
  appNetworkId,
  appNetwork,
  title,
} from './constants';
import plutus from 'plutus.json';

export class Cip68Contract {
  private meshTxBuilder: MeshTxBuilder;
  private wallet: MeshWallet;
  private fetcher: IFetcher;
  private blockfrostProvider: BlockfrostProvider;

  private pubKeyExchange: string;
  private pubKeyIssuer: string;
  private storeScriptCbor: string;
  private mintScriptCbor: string;
  public storeAddress: string;
  public policyId: string;

  constructor({ wallet }: { wallet: MeshWallet }) {
    this.wallet = wallet;
    this.blockfrostProvider = new BlockfrostProvider(BLOCKFROST_API_KEY);
    this.fetcher = this.blockfrostProvider;

    this.meshTxBuilder = new MeshTxBuilder({
      fetcher: this.fetcher,
      evaluator: this.blockfrostProvider,
    });

    this.pubKeyIssuer = deserializeAddress(
      this.wallet.getChangeAddress(),
    ).pubKeyHash;
    this.pubKeyExchange = deserializeAddress(APP_WALLET_ADDRESS).pubKeyHash;

    const mintCompileCode = this.readValidator(plutus as Plutus, title.mint);
    const storeCompileCode = this.readValidator(plutus as Plutus, title.store);

    this.storeScriptCbor = applyParamsToScript(storeCompileCode, [
      this.pubKeyExchange,
      BigInt(1),
      this.pubKeyIssuer,
    ]);

    const storeScript: PlutusScript = {
      code: this.storeScriptCbor,
      version: 'V3',
    };

    this.storeAddress = serializeAddressObj(
      scriptAddress(
        deserializeAddress(
          serializePlutusScript(storeScript, undefined, appNetworkId, false)
            .address,
        ).scriptHash,
        deserializeAddress(APP_WALLET_ADDRESS).stakeCredentialHash,
        false,
      ),
      appNetworkId,
    );

    const storeScriptHash = deserializeAddress(this.storeAddress).scriptHash;

    this.mintScriptCbor = applyParamsToScript(mintCompileCode, [
      this.pubKeyExchange,
      BigInt(1),
      storeScriptHash,
      deserializeAddress(APP_WALLET_ADDRESS).stakeCredentialHash,
      this.pubKeyIssuer,
    ]);

    this.policyId = resolveScriptHash(this.mintScriptCbor, 'V3');
  }

  private readValidator(plutus: Plutus, title: string): string {
    const validator = plutus.validators.find((v) => v.title === title);
    if (!validator) throw new Error(`${title} validator not found`);
    return validator.compiledCode;
  }

  private async getWalletForTx() {
    const utxos = await this.wallet.getUtxos();
    const walletAddress = this.wallet.getChangeAddress();

    if (!utxos || utxos.length === 0) throw new Error('No UTXOs found');
    if (!walletAddress) throw new Error('No wallet address found');

    let collaterals = await this.wallet.getCollateral();
    if (!collaterals || collaterals.length === 0) {
      const suitableUtxo = utxos.find((utxo) => {
        const hasOnlyLovelace =
          utxo.output.amount.length === 1 &&
          utxo.output.amount[0].unit === 'lovelace';
        const lovelace = BigInt(utxo.output.amount[0].quantity);
        return hasOnlyLovelace && lovelace >= 5_000_000n;
      });
      if (!suitableUtxo) {
        throw new Error(
          'No suitable UTxO for collateral (need >= 5 ADA with no tokens)',
        );
      }
      collaterals = [suitableUtxo];
    }

    return { utxos, collateral: collaterals[0], walletAddress };
  }

  private async getAddressUTXOAsset(address: string, unit: string) {
    const utxos = await this.fetcher.fetchAddressUTxOs(address, unit);
    return utxos[utxos.length - 1];
  }

  async payment({ amount }: { amount: string }) {
    const { walletAddress, collateral, utxos } = await this.getWalletForTx();

    const unsignedTx = this.meshTxBuilder
      .txOut(APP_WALLET_ADDRESS, [{ unit: 'lovelace', quantity: amount }])
      .changeAddress(walletAddress)
      .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
      )
      .setNetwork(appNetwork);

    return await unsignedTx.complete();
  }

  async mint(
    params: {
      assetName: string;
      metadata: Record<string, string>;
      quantity: string;
      receiver: string;
    }[],
  ) {
    const { utxos, walletAddress, collateral } = await this.getWalletForTx();

    this.meshTxBuilder = new MeshTxBuilder({
      fetcher: this.fetcher,
      evaluator: this.blockfrostProvider,
    });

    const unsignedTx = this.meshTxBuilder.mintPlutusScriptV3();
    const txOutReceiverMap = new Map<
      string,
      { unit: string; quantity: string }[]
    >();

    for (const { assetName, metadata, quantity = '1', receiver } of params) {
      const receiverAddress = receiver || walletAddress;

      const existingUtxo = await this.getAddressUTXOAsset(
        this.storeAddress,
        this.policyId + CIP68_100(stringToHex(assetName)),
      );

      if (existingUtxo?.output?.plutusData) {
        throw new Error(`Asset "${assetName}" already exists`);
      }

      if (txOutReceiverMap.has(receiverAddress)) {
        txOutReceiverMap.get(receiverAddress)!.push({
          unit: this.policyId + CIP68_222(stringToHex(assetName)),
          quantity,
        });
      } else {
        txOutReceiverMap.set(receiverAddress, [
          { unit: this.policyId + CIP68_222(stringToHex(assetName)), quantity },
        ]);
      }

      unsignedTx
        .mintPlutusScriptV3()
        .mint(quantity, this.policyId, CIP68_222(stringToHex(assetName)))
        .mintingScript(this.mintScriptCbor)
        .mintRedeemerValue(mConStr0([]))
        .mintPlutusScriptV3()
        .mint('1', this.policyId, CIP68_100(stringToHex(assetName)))
        .mintingScript(this.mintScriptCbor)
        .mintRedeemerValue(mConStr0([]))
        .txOut(this.storeAddress, [
          {
            unit: this.policyId + CIP68_100(stringToHex(assetName)),
            quantity: '1',
          },
        ])
        .txOutInlineDatumValue(metadataToCip68(metadata));
    }

    txOutReceiverMap.forEach((assets, receiver) => {
      unsignedTx.txOut(receiver, assets);
    });

    unsignedTx
      .txOut(APP_WALLET_ADDRESS, [
        { unit: 'lovelace', quantity: EXCHANGE_FEE_PRICE },
      ])
      .changeAddress(walletAddress)
      .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
      )
      .setNetwork(appNetwork);

    return await unsignedTx.complete();
  }

  async burn(params: { assetName: string; quantity: string }[]) {
    const { utxos, walletAddress, collateral } = await this.getWalletForTx();

    this.meshTxBuilder = new MeshTxBuilder({
      fetcher: this.fetcher,
      evaluator: this.blockfrostProvider,
    });

    const unsignedTx = this.meshTxBuilder;

    for (const { assetName, quantity } of params) {
      const storeUtxo = await this.getAddressUTXOAsset(
        this.storeAddress,
        this.policyId + CIP68_100(stringToHex(assetName)),
      );

      if (!storeUtxo) throw new Error(`Asset "${assetName}" not found`);

      unsignedTx
        .mintPlutusScriptV3()
        .mint(quantity, this.policyId, CIP68_222(stringToHex(assetName)))
        .mintRedeemerValue(mConStr1([]))
        .mintingScript(this.mintScriptCbor)
        .mintPlutusScriptV3()
        .mint('-1', this.policyId, CIP68_100(stringToHex(assetName)))
        .mintRedeemerValue(mConStr1([]))
        .mintingScript(this.mintScriptCbor)
        .spendingPlutusScriptV3()
        .txIn(storeUtxo.input.txHash, storeUtxo.input.outputIndex)
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr1([]))
        .txInScript(this.storeScriptCbor);
    }

    unsignedTx
      .txOut(APP_WALLET_ADDRESS, [
        { unit: 'lovelace', quantity: EXCHANGE_FEE_PRICE },
      ])
      .changeAddress(walletAddress)
      .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
      )
      .setNetwork(appNetwork);

    return await unsignedTx.complete();
  }

  async update(
    params: { assetName: string; metadata: Record<string, string> }[],
  ) {
    const { utxos, walletAddress, collateral } = await this.getWalletForTx();

    this.meshTxBuilder = new MeshTxBuilder({
      fetcher: this.fetcher,
      evaluator: this.blockfrostProvider,
    });

    const unsignedTx = this.meshTxBuilder;

    for (const { assetName, metadata } of params) {
      const storeUtxo = await this.getAddressUTXOAsset(
        this.storeAddress,
        this.policyId + CIP68_100(stringToHex(assetName)),
      );

      if (!storeUtxo) throw new Error(`Asset "${assetName}" not found`);

      unsignedTx
        .spendingPlutusScriptV3()
        .txIn(storeUtxo.input.txHash, storeUtxo.input.outputIndex)
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr0([]))
        .txInScript(this.storeScriptCbor)
        .txOut(this.storeAddress, [
          {
            unit: this.policyId + CIP68_100(stringToHex(assetName)),
            quantity: '1',
          },
        ])
        .txOutInlineDatumValue(metadataToCip68(metadata));
    }

    unsignedTx
      .txOut(APP_WALLET_ADDRESS, [
        { unit: 'lovelace', quantity: EXCHANGE_FEE_PRICE },
      ])
      .changeAddress(walletAddress)
      .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
      )
      .setNetwork(appNetwork);

    return await unsignedTx.complete();
  }
}
