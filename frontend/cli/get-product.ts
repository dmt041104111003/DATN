import "dotenv/config";
import chalk from "chalk";
import { BlockfrostProvider, MeshWallet, CIP68_100, stringToHex } from "@meshsdk/core";
import { Contract } from "@/contract/scripts/offchain";
import { deserializeDatum } from "@/lib/utils";

const owners: Array<string> = [
  "addr_test1qrplj973a94sz46jqhfdmr87r9jngdw3ec2e3vygedquu0mhmfn5pu6rc4ynwh4p4ssxdjy7tdp6m27ggkq8ym0jlvgqqset5j",
  "addr_test1qr9ql9xgnntlwrtqklw8uand62usxq6y4gknrta58m8r0dcswr2qa03gpcus5s630ncctdjfjg7x4f802zqfy0xd9mlqndztal",
  "addr_test1qrw7yktcc7wsscq46pfamt8t9yd2mlp7dtgjw3mq2hqplgvax05kaj8z5tgvtqd5q4xug4qqdgnzn2l8krm09c85f4psmzum9f",
  "addr_test1qztthppkvnl2k2gk96r6v22qxvwyymh4dr4njclae8wwau8d3tp4cyr8p83gs3vjnhmldj8vzhkx3cvnr80gjdfvdfdqcr2qz4",
];

async function main() {
  const assetName = process.argv[2] || "Huawei Watch GT4 V9";

  if (!process.env.BLOCKFROST_API_KEY) {
    throw new Error("BLOCKFROST_API_KEY is not set in .env");
  }
  if (!process.env.MNEMONIC) {
    throw new Error("MNEMONIC is not set in .env");
  }

  const provider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY);

  const wallet = new MeshWallet({
    networkId: 0,
    accountIndex: 0,
    fetcher: provider,
    submitter: provider,
    key: {
      type: "mnemonic",
      words: process.env.MNEMONIC.split(" "),
    },
  });

  const contract = new Contract({
    wallet,
    provider,
    owners,
  });

  const policyId = contract.policyId;
  const contractAddress = contract.contractAddress;
  const unit = policyId + CIP68_100(stringToHex(assetName));

  console.log(chalk.cyan("Asset name:"), assetName);
  console.log(chalk.cyan("Policy ID:"), policyId);
  console.log(chalk.cyan("Contract address:"), contractAddress);
  console.log(chalk.cyan("Unit:"), unit);

  const utxos = await provider.fetchAddressUTxOs(contractAddress, unit);

  if (!utxos.length) {
    console.log(chalk.red("No UTxOs found for this unit at contract address."));
    return;
  }

  console.log(chalk.green(`Found ${utxos.length} UTxO(s):`));
  for (const utxo of utxos) {
    console.log("TX:", utxo.input.txHash, "#", utxo.input.outputIndex);
    if (utxo.output.plutusData) {
      const metadata = await deserializeDatum(utxo.output.plutusData as string);
      console.log("Decoded datum metadata:", JSON.stringify(metadata, null, 2));
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

