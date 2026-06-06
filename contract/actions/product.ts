"use server";

import { Contract } from "@/contract/scripts/offchain";
import { convertDatum } from "@/lib/utils";
import { blockfrostProvider } from "@/providers/cardano";
import { CIP68_100, MeshWallet, stringToHex } from "@meshsdk/core";

export const getProduct = async function ({
  owners,
  assetName,
}: {
  owners: Array<string>;
  assetName: string;
}) {
  const wallet = new MeshWallet({
    networkId: 0,
    accountIndex: 0,
    fetcher: blockfrostProvider,
    submitter: blockfrostProvider,
    key: {
      type: "mnemonic",
      words: process.env.MNEMONIC?.split(" ") || [],
    },
  });
  const contract = new Contract({
    owners: owners,
    wallet: wallet,
    provider: blockfrostProvider,
  });
  const policyId = contract.policyId;
  const contractAddress = contract.contractAddress;

  const utxo = (
    await blockfrostProvider.fetchAddressUTxOs(
      contractAddress,
      policyId + CIP68_100(stringToHex(assetName)),
    )
  )[0];

  if (!utxo) {
    throw new Error("No Asset Not Found From UTxOs.");
  }

  const metadata = convertDatum(utxo.output.plutusData as string);

  return {
    policyId: policyId,
    assetName: CIP68_100(stringToHex(assetName)),
    metadata: metadata,
  };
};
