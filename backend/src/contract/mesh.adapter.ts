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
} from '@meshsdk/core';
import type { UTxO, PlutusScript, IFetcher } from '@meshsdk/core';
import type { Plutus } from './types';
import {
  APP_WALLET_ADDRESS,
  APP_MNEMONIC,
  BLOCKFROST_API_KEY,
  appNetworkId,
  title,
} from './constants';

import plutus from 'plutus.json';

export class MeshAdapter {
  protected meshTxBuilder: MeshTxBuilder;
  protected wallet: MeshWallet;
  protected fetcher: IFetcher;
  protected blockfrostProvider: BlockfrostProvider;

  protected pubKeyExchange?: string;
  protected pubKeyIssuer?: string;
  protected mintCompileCode?: string;
  protected storeCompileCode?: string;
  protected storeScriptCbor?: string;
  protected storeScript?: PlutusScript;
  public storeAddress?: string;
  protected storeScriptHash?: string;
  protected mintScriptCbor?: string;
  protected mintScript?: PlutusScript;
  public policyId?: string;

  private initialized = false;

  constructor(wallet?: MeshWallet) {
    this.blockfrostProvider = new BlockfrostProvider(BLOCKFROST_API_KEY);
    this.fetcher = this.blockfrostProvider;

    if (wallet) {
      this.wallet = wallet;
    } else {
      this.wallet = new MeshWallet({
        networkId: appNetworkId as 0 | 1,
        fetcher: this.blockfrostProvider,
        submitter: this.blockfrostProvider,
        key: { type: 'mnemonic', words: APP_MNEMONIC.split(' ') },
      });
    }

    this.meshTxBuilder = this.createMeshTxBuilder();
  }

  protected createMeshTxBuilder(): MeshTxBuilder {
    return new MeshTxBuilder({
      fetcher: this.fetcher,
      evaluator: this.blockfrostProvider,
    });
  }

  public async init() {
    if (this.initialized) return;

    this.pubKeyIssuer = deserializeAddress(
      await this.wallet.getChangeAddress(),
    ).pubKeyHash;
    this.pubKeyExchange = deserializeAddress(APP_WALLET_ADDRESS).pubKeyHash;

    this.mintCompileCode = this.readValidator(plutus as Plutus, title.mint);
    this.storeCompileCode = this.readValidator(plutus as Plutus, title.store);

    this.storeScriptCbor = applyParamsToScript(this.storeCompileCode, [
      this.pubKeyExchange,
      BigInt(1),
      this.pubKeyIssuer,
    ]);

    this.storeScript = { code: this.storeScriptCbor, version: 'V3' };

    this.storeAddress = serializeAddressObj(
      scriptAddress(
        deserializeAddress(
          serializePlutusScript(this.storeScript, undefined, appNetworkId, false)
            .address,
        ).scriptHash,
        deserializeAddress(APP_WALLET_ADDRESS).stakeCredentialHash,
        false,
      ),
      appNetworkId,
    );

    this.storeScriptHash = deserializeAddress(this.storeAddress).scriptHash;

    this.mintScriptCbor = applyParamsToScript(this.mintCompileCode, [
      this.pubKeyExchange,
      BigInt(1),
      this.storeScriptHash,
      deserializeAddress(APP_WALLET_ADDRESS).stakeCredentialHash,
      this.pubKeyIssuer,
    ]);

    this.mintScript = { code: this.mintScriptCbor, version: 'V3' };
    this.policyId = resolveScriptHash(this.mintScriptCbor, 'V3');

    this.initialized = true;
  }

  protected async getWalletForTx() {
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
        return hasOnlyLovelace && lovelace >= 5_000_000n; // >= 5 ADA
      });

      if (!suitableUtxo) {
        throw new Error('No suitable UTxO for collateral (need >= 5 ADA with no tokens)');
      }
      
      collaterals = [suitableUtxo];
    }

    return { utxos, collateral: collaterals[0], walletAddress };
  }

  protected readValidator(plutus: Plutus, title: string): string {
    const validator = plutus.validators.find((v) => v.title === title);
    if (!validator) {
      throw new Error(`${title} validator not found`);
    }
    return validator.compiledCode;
  }

  protected async getAddressUTXOAsset(address: string, unit: string) {
    const utxos = await this.fetcher.fetchAddressUTxOs(address, unit);
    return utxos[utxos.length - 1];
  }

  protected async getAddressUTXOAssets(address: string, unit: string) {
    return this.fetcher.fetchAddressUTxOs(address, unit);
  }

  async signAndSubmit(unsignedTx: string): Promise<string> {
    const signedTx = await this.wallet.signTx(unsignedTx, true);
    const txHash = await this.wallet.submitTx(signedTx);
    return txHash;
  }

  async waitForConfirmation(txHash: string): Promise<void> {
    return new Promise((resolve) => {
      this.blockfrostProvider.onTxConfirmed(txHash, () => {
        resolve();
      });
    });
  }
}
