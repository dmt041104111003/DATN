import {
  applyParamsToScript,
  BlockfrostProvider,
  deserializeAddress,
  type IFetcher,
  MeshTxBuilder,
  MeshWallet,
  mPubKeyAddress,
  type PlutusScript,
  resolveScriptHash,
  Data,
  serializePlutusScript,
  type UTxO,
} from "@meshsdk/core";
import blueprint from "../plutus.json";

type WalletLike = {
  getUtxos: () => Promise<UTxO[]>;
  getCollateral: () => Promise<UTxO[]>;
  getChangeAddress: () => Promise<string>;
};

export class MeshAdapter {
  protected wallet: WalletLike;
  protected fetcher: IFetcher;

  protected mintCompileCode: string;
  protected mintScriptCbor!: string;
  protected mintScript!: PlutusScript;

  protected spendCompileCode: string;
  protected spendScriptCbor!: string;
  protected spendScript!: PlutusScript;

  public policyId!: string;
  public contractAddress!: string;
  protected meshTxBuilder: MeshTxBuilder;

  constructor({
    wallet,
    owners,
    provider,
  }: {
    wallet: WalletLike;
    owners: Array<string>;
    provider: BlockfrostProvider;
  }) {
    this.wallet = wallet;
    this.fetcher = provider;
    this.meshTxBuilder = new MeshTxBuilder({
      fetcher: provider,
    });

    this.spendCompileCode = this.readValidator(
      blueprint,
      "traceability.store.spend",
    );
    this.spendScriptCbor = applyParamsToScript(
      this.spendCompileCode,
      [
        owners.map((owner) =>
          mPubKeyAddress(
            deserializeAddress(owner).pubKeyHash,
            deserializeAddress(owner).stakeCredentialHash,
          ),
        ),
      ],
      "Mesh",
    );
    this.spendScript = { code: this.spendScriptCbor, version: "V3" };
    this.contractAddress = serializePlutusScript(
      this.spendScript,
      undefined,
      0,
      false,
    ).address;

    this.mintCompileCode = this.readValidator(
      blueprint,
      "traceability.mint.mint",
    );
    this.mintScriptCbor = applyParamsToScript(
      this.mintCompileCode,
      [
        owners.map((owner) =>
          mPubKeyAddress(
            deserializeAddress(owner).pubKeyHash,
            deserializeAddress(owner).stakeCredentialHash,
          ),
        ),
        mPubKeyAddress(
          deserializeAddress(this.contractAddress).scriptHash,
          deserializeAddress(this.contractAddress).stakeCredentialHash,
        ),
      ],
      "Mesh",
    );
    this.mintScript = { code: this.mintScriptCbor, version: "V3" };
    this.policyId = resolveScriptHash(this.mintScriptCbor, "V3");
  }

  protected getWalletForTx = async (): Promise<{
    utxos: UTxO[];
    collateral: UTxO;
    walletAddress: string;
  }> => {
    const utxos = await this.wallet.getUtxos();
    const collaterals = await this.wallet.getCollateral();
    const walletAddress = await this.wallet.getChangeAddress();
    if (!walletAddress)
      throw new Error("No wallet address found in getWalletForTx method.");

    if (!utxos || utxos.length === 0)
      throw new Error("No UTXOs found in getWalletForTx method.");

    if (!collaterals || collaterals.length === 0)
      throw new Error("No collateral found in getWalletForTx method.");

    return { utxos, collateral: collaterals[0], walletAddress };
  };

  protected getUtxoForTx = async (address: string, txHash: string) => {
    const utxos: UTxO[] = await this.fetcher.fetchAddressUTxOs(address);
    const utxo = utxos.find(function (utxo: UTxO) {
      return utxo.input.txHash === txHash;
    });

    if (!utxo) throw new Error("No UTXOs found in getUtxoForTx method.");
    return utxo;
  };

  protected readValidator = function (plutus: any, title: string): string {
    const validator = plutus.validators.find(function (validator: any) {
      return validator.title === title;
    });

    if (!validator) {
      throw new Error(`${title} validator not found.`);
    }

    return validator.compiledCode;
  };


  protected getAddressUTXOAsset = async (address: string, unit: string) => {
    const utxos = await this.fetcher.fetchAddressUTxOs(address, unit);
    return utxos[utxos.length - 1];
  };

  protected getAddressUTXOAssets = async (address: string, unit: string) => {
    return await this.fetcher.fetchAddressUTxOs(address, unit);
  };

  protected metadataToCip68 = (metadata: any): Data => {
    switch (typeof metadata) {
      case "object":
        if (metadata instanceof Array) {
          return metadata.map((item) => this.metadataToCip68(item));
        }
        const metadataMap = new Map();
        const keys = Object.keys(metadata);
        keys.forEach((key) => {
          metadataMap.set(key, this.metadataToCip68(metadata[key]));
        });
        return {
          alternative: 0,
          fields: [metadataMap, 1],
        };

      default:
        return metadata;
    }
  };
}
