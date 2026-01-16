import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  CIP68_222,
  CIP68_100,
  stringToHex,
  mConStr0,
  mConStr1,
  metadataToCip68,
  deserializeAddress,
} from '@meshsdk/core';
import { MeshAdapter } from './mesh.adapter';
import { appNetwork, APP_WALLET_ADDRESS, EXCHANGE_FEE_PRICE } from './constants';
import { MintDto } from './dto/mint.dto';
import { BurnDto } from './dto/burn.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';

@Injectable()
export class ContractService extends MeshAdapter implements OnModuleInit {
  async onModuleInit() {
    await this.init();
    console.log('ContractService initialized, policyId:', this.policyId);
  }


  async mint(params: MintDto[]): Promise<{ txHash: string }> {
    console.log('Mint params:', JSON.stringify(params, null, 2));
    await this.init();
    const { utxos, walletAddress, collateral } = await this.getWalletForTx();

    this.meshTxBuilder = this.createMeshTxBuilder();
    const unsignedTx = this.meshTxBuilder.mintPlutusScriptV3();
    const txOutReceiverMap = new Map<string, { unit: string; quantity: string }[]>();

    for (const { assetName, metadata, quantity = '1', receiver } of params) {
      const receiverAddress = receiver || walletAddress;

      const existingUtxo = await this.getAddressUTXOAsset(
        this.storeAddress!,
        this.policyId! + CIP68_100(stringToHex(assetName)),
      );

      if (existingUtxo?.output?.plutusData) {
        throw new Error(`Asset "${assetName}" already exists`);
      }

      if (txOutReceiverMap.has(receiverAddress)) {
        txOutReceiverMap.get(receiverAddress)!.push({
          unit: this.policyId! + CIP68_222(stringToHex(assetName)),
          quantity,
        });
      } else {
        txOutReceiverMap.set(receiverAddress, [
          { unit: this.policyId! + CIP68_222(stringToHex(assetName)), quantity },
        ]);
      }

      unsignedTx
        .mintPlutusScriptV3()
        .mint(quantity, this.policyId!, CIP68_222(stringToHex(assetName)))
        .mintingScript(this.mintScriptCbor!)
        .mintRedeemerValue(mConStr0([]))
        .mintPlutusScriptV3()
        .mint('1', this.policyId!, CIP68_100(stringToHex(assetName)))
        .mintingScript(this.mintScriptCbor!)
        .mintRedeemerValue(mConStr0([]))
        .txOut(this.storeAddress!, [
          { unit: this.policyId! + CIP68_100(stringToHex(assetName)), quantity: '1' },
        ])
        .txOutInlineDatumValue(metadataToCip68(metadata));
    }

    txOutReceiverMap.forEach((assets, receiver) => {
      unsignedTx.txOut(receiver, assets);
    });

    unsignedTx
      .txOut(APP_WALLET_ADDRESS, [{ unit: 'lovelace', quantity: EXCHANGE_FEE_PRICE }])
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

    const completedTx = await unsignedTx.complete();
    const txHash = await this.signAndSubmit(completedTx);
    return { txHash };
  }

  
  async burn(params: BurnDto[]): Promise<{ txHash: string }> {
    await this.init();
    const { utxos, walletAddress, collateral } = await this.getWalletForTx();

    this.meshTxBuilder = this.createMeshTxBuilder();
    const unsignedTx = this.meshTxBuilder;

    for (const { assetName, quantity } of params) {
      const storeUtxo = await this.getAddressUTXOAsset(
        this.storeAddress!,
        this.policyId! + CIP68_100(stringToHex(assetName)),
      );

      if (!storeUtxo) {
        throw new Error(`Asset "${assetName}" not found`);
      }

      unsignedTx
        .mintPlutusScriptV3()
        .mint(quantity, this.policyId!, CIP68_222(stringToHex(assetName)))
        .mintRedeemerValue(mConStr1([]))
        .mintingScript(this.mintScriptCbor!)
        .mintPlutusScriptV3()
        .mint('-1', this.policyId!, CIP68_100(stringToHex(assetName)))
        .mintRedeemerValue(mConStr1([]))
        .mintingScript(this.mintScriptCbor!)
        .spendingPlutusScriptV3()
        .txIn(storeUtxo.input.txHash, storeUtxo.input.outputIndex)
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr1([]))
        .txInScript(this.storeScriptCbor!);
    }

    unsignedTx
      .txOut(APP_WALLET_ADDRESS, [{ unit: 'lovelace', quantity: EXCHANGE_FEE_PRICE }])
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

    const completedTx = await unsignedTx.complete();
    const txHash = await this.signAndSubmit(completedTx);
    return { txHash };
  }


  async update(params: UpdateMetadataDto[]): Promise<{ txHash: string }> {
    await this.init();
    const { utxos, walletAddress, collateral } = await this.getWalletForTx();

    this.meshTxBuilder = this.createMeshTxBuilder();
    const unsignedTx = this.meshTxBuilder;

    for (const { assetName, metadata } of params) {
      const storeUtxo = await this.getAddressUTXOAsset(
        this.storeAddress!,
        this.policyId! + CIP68_100(stringToHex(assetName)),
      );

      if (!storeUtxo) {
        throw new Error(`Asset "${assetName}" not found`);
      }

      unsignedTx
        .spendingPlutusScriptV3()
        .txIn(storeUtxo.input.txHash, storeUtxo.input.outputIndex)
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr0([]))
        .txInScript(this.storeScriptCbor!)
        .txOut(this.storeAddress!, [
          { unit: this.policyId! + CIP68_100(stringToHex(assetName)), quantity: '1' },
        ])
        .txOutInlineDatumValue(metadataToCip68(metadata));
    }

    unsignedTx
      .txOut(APP_WALLET_ADDRESS, [{ unit: 'lovelace', quantity: EXCHANGE_FEE_PRICE }])
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
}
