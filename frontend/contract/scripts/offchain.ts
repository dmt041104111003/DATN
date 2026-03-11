import {
  CIP68_100,
  CIP68_222,
  deserializeAddress,
  mConStr0,
  mConStr1,
  metadataToCip68,
  stringToHex,
} from "@meshsdk/core";
import { MeshAdapter } from "./mesh";

/**
 * Contract class
 *
 * This class provides methods to manage a status token lifecycle
 * on the Cardano blockchain using Mesh SDK and Plutus V3 scripts.
 *
 * Main responsibilities:
 * - Lock: Mint or update a status token and mark it as locked.
 * - UnLock: Update an existing status token to mark it as unlocked.
 * - Authorize: Change or assign a new authorized address to a status token.
 *
 * Each method constructs an unsigned transaction that must be signed
 * and submitted by the wallet. The class extends MeshAdapter to
 * reuse wallet and transaction builder utilities.
 *
 * Usage:
 *   const manager = new Contract({ meshWallet });
 *   const tx = await manager.lock({ title: "My Status" });
 *   const signedTx = await meshWallet.signTx(tx, true);
 *   const txHash = await meshWallet.submitTx(signedTx);
 *
 * Network: Currently set to "preprod" (testnet).
 */

export class Contract extends MeshAdapter {
  mint = async ({
    assetName,
    metadata,
    quantity = "1",
    receiver,
  }: {
    assetName: string;
    metadata: Record<string, string>;
    quantity?: string;
    receiver?: string;
  }) => {
    const { utxos, collateral, walletAddress } = await this.getWalletForTx();

    const utxo = await this.getAddressUTXOAsset(
      this.contractAddress,
      this.policyId + CIP68_100(stringToHex(assetName)),
    );
    if (utxo) {
      throw new Error("this asset has been minted");
    }
    const unsignedTx = this.meshTxBuilder
      .mintPlutusScriptV3()
      .mint(quantity, this.policyId, CIP68_222(stringToHex(assetName)))
      .mintingScript(this.mintScriptCbor)
      .mintRedeemerValue(mConStr0([]))

      .mintPlutusScriptV3()
      .mint("1", this.policyId, CIP68_100(stringToHex(assetName)))
      .mintingScript(this.mintScriptCbor)
      .mintRedeemerValue(mConStr0([]))
      .txOut(this.contractAddress, [
        {
          unit: this.policyId + CIP68_100(stringToHex(assetName)),
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue(metadataToCip68(metadata))
      .txOut(receiver || walletAddress, [
        {
          unit: this.policyId + CIP68_222(stringToHex(assetName)),
          quantity: quantity,
        },
      ])
      .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
      .changeAddress(walletAddress)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
      )
      .setNetwork("preprod");
    return await unsignedTx.complete();
  };

  update = async ({
    assetName,
    metadata,
  }: {
    assetName: string;
    metadata: Record<string, string>;
  }) => {
    const { utxos, walletAddress, collateral } = await this.getWalletForTx();
    const referenceUnit = this.policyId + CIP68_100(stringToHex(assetName));
    const referenceUtxo = await this.getAddressUTXOAsset(
      this.contractAddress,
      referenceUnit,
    );
    if (!referenceUtxo) throw new Error("Reference Utxo Not Found");

    const unsignedTx = this.meshTxBuilder
      .spendingPlutusScriptV3()
      .txIn(referenceUtxo.input.txHash, referenceUtxo.input.outputIndex)
      .txInInlineDatumPresent()
      .txInRedeemerValue(mConStr0([]))
      .txInScript(this.spendScriptCbor)
      .txOut(this.contractAddress, [
        {
          unit: referenceUnit,
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue(metadataToCip68(metadata))
      .changeAddress(walletAddress)
      .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
      )
      .setNetwork("preprod");
    return await unsignedTx.complete();
  };

  burn = async ({ assetName }: { assetName: string }) => {
    const { utxos, walletAddress, collateral } = await this.getWalletForTx();

    const userUnit = this.policyId + CIP68_222(stringToHex(assetName));
    const referenceUnit = this.policyId + CIP68_100(stringToHex(assetName));
    const userUtxos = await this.getAddressUTXOAssets(walletAddress, userUnit);
    const referenceUtxo = await this.getAddressUTXOAsset(
      this.contractAddress,
      referenceUnit,
    );
    if (!referenceUtxo) throw new Error("Reference Utxo Not Found");

    const amount = userUtxos
      .flatMap((u) => u.output.amount)
      .filter((a) => a.unit === userUnit)
      .reduce((sum, a) => sum + Number(a.quantity), 0);

    const unsignedTx = this.meshTxBuilder;
    if (amount) {
      unsignedTx
        .mintPlutusScriptV3()
        .mint(`-${amount}`, this.policyId, CIP68_222(stringToHex(assetName)))
        .mintRedeemerValue(mConStr1([]))
        .mintingScript(this.mintScriptCbor);
    }
    unsignedTx
      .mintPlutusScriptV3()
      .mint("-1", this.policyId, CIP68_100(stringToHex(assetName)))
      .mintRedeemerValue(mConStr1([]))
      .mintingScript(this.mintScriptCbor)

      .spendingPlutusScriptV3()
      .spendingPlutusScriptV3()
      .txIn(referenceUtxo.input.txHash, referenceUtxo.input.outputIndex)
      .txInInlineDatumPresent()
      .txInRedeemerValue(mConStr1([]))
      .txInScript(this.spendScriptCbor)

      .changeAddress(walletAddress)
      .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
      )
      .setNetwork("preprod");
    return await unsignedTx.complete();
  };
}
