import { BlockfrostProvider, CIP68_100, MeshWallet, stringToHex } from "@meshsdk/core";
import { Contract } from "@/contract/scripts/offchain";
import { convertDatum } from "@/lib/utils";

const blockfrostProvider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY || "");

export async function getProduct({
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
    owners,
    wallet,
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
    throw new Error("Không tìm thấy thùng hàng on-chain.");
  }

  const metadata = convertDatum(utxo.output.plutusData as string);

  return {
    policyId,
    assetName: CIP68_100(stringToHex(assetName)),
    metadata,
  };
}
