import "dotenv/config";
import chalk from "chalk";
import {
  BlockfrostProvider,
  CIP68_100,
  MeshWallet,
  stringToHex,
} from "@meshsdk/core";

import { Contract } from "./offchain";
import {
  SAMPLE_CONTAINER_ASSET_NAME,
  buildContainerMintMetadata,
  buildContainerUpdateMetadata,
} from "./agriMetadata";
import { getTracking } from "@/actions/tracking";
import { getProduct } from "@/actions/product";

const provider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY || "");

const wallet = new MeshWallet({
  networkId: 0,
  accountIndex: 0,
  fetcher: provider,
  submitter: provider,
  key: {
    type: "mnemonic",
    words: process.env.MNEMONIC?.split(" ") || [],
  },
});


const owners: Array<string> = [
  "addr_test1qqtyewfuqem6h8h4n7u7fpuza4kf8a857wrjxsd0a7lhzuzcd7fe2qt7kw4l9vk5eczsndjdnk5v8zusrmgmc7mjxytqe0txk0",
  "addr_test1qrr879mjnxd3gjqjdgjxkwzfcnvcgsve927scqk5fc3gfs2hs03pn7uhujentyhzq3ays72u4xtfrlahyjalujhxufsqdeezc0",
  "addr_test1qzkkuy580f2fgpfrvud4re9m2lut5u4ddksnsq8t3t69vge02ae9qh0rjqdxk9p2ur9dj0xpeejd04fzreqrv35pms2sy2ega2",
  "addr_test1qqzqsq2wvfnkj809ld3lyf8sayzdgq9m2naahcf9gy76am5uzdmstnrvnru4l0hyzvmru3h2j22lnatgp6407m96nh0sq3w38z",
];

const ASSET_NAME_UTF8 = SAMPLE_CONTAINER_ASSET_NAME;
const ASSET_NAME_HEX = Buffer.from(ASSET_NAME_UTF8, "utf8").toString("hex");

const printHeader = (title: string) => {
  console.log(
    chalk.bold.blue("┌──────────────────────────────────────────────┐"),
  );
  console.log(
    chalk.bold.blue(`│          ${title.padEnd(44 - title.length)}    │`),
  );
  console.log(
    chalk.bold.blue("└──────────────────────────────────────────────┘"),
  );
  console.log("");
};

const printSuccessBox = (message: string) => {
  console.log(chalk.bgGreen.black(" SUCCESS "));
  console.log(chalk.green.bold(message));
  console.log("");
};

const printErrorBox = (message: string) => {
  console.log(chalk.bgRed.black(" ERROR "));
  console.log(chalk.red.bold(message));
  console.log("");
};

const waitForConfirmation = (txHash: string): Promise<void> =>
  new Promise((resolve) => {
    provider.onTxConfirmed(txHash, () => {
      console.log("");
      printSuccessBox("Transaction confirmed on-chain!");
      console.log(
        chalk.cyan("Explorer:"),
        chalk.underline(`https://preprod.cexplorer.io/tx/${txHash}`),
      );
      resolve();
    });
  });

export const mint = async () => {
  const startTime = Date.now();
  printHeader("MINT THÙNG HÀNG (CIP-68)");

  try {
    const contract = new Contract({
      wallet,
      provider,
      owners,
    });

    console.log(chalk.cyan("PolicyId:"), chalk.gray(contract.policyId));
    console.log(chalk.cyan("Asset:"), chalk.whiteBright(ASSET_NAME_UTF8));
    console.log(chalk.cyan("Asset Name (hex):"), chalk.gray(ASSET_NAME_HEX));
    console.log("");

    console.log(chalk.yellow("Preparing metadata for mint..."));
    const metadata = buildContainerMintMetadata(owners);

    console.log(chalk.green("✓ Metadata prepared"));
    console.log(chalk.dim(`Sản phẩm: ${metadata.product_name}`));
    console.log(chalk.dim(`Chuỗi địa điểm: ${metadata.participant_location_labels}`));
    console.log(
      chalk.dim(
        `Người ký: ${metadata.signer_location_label || "—"} (${metadata.signer_role || "—"})`,
      ),
    );
    console.log("");

    console.log(chalk.yellow("Building mint transaction..."));
    const unsignedTx = await contract.mint({
      assetName: ASSET_NAME_UTF8,
      metadata: metadata,
    });
    console.log(chalk.green("✓ Unsigned tx created"));
    console.log("");

    console.log(chalk.yellow("Signing transaction..."));
    const signedTx = await wallet.signTx(unsignedTx, true);
    console.log(chalk.green("✓ Signed successfully"));
    console.log("");

    console.log(chalk.yellow("Submitting to network..."));
    const txHash = await wallet.submitTx(signedTx);
    console.log(chalk.green("✓ Tx submitted!"));
    console.log("");
    console.log(chalk.bold.magenta("Tx Hash:"), chalk.whiteBright(txHash));
    console.log(
      chalk.cyan("Explorer:"),
      chalk.underline(`https://preprod.cexplorer.io/tx/${txHash}`),
    );
    console.log("");

    console.log(chalk.yellow("Awaiting confirmation..."));
    await waitForConfirmation(txHash);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      chalk.bold.blue("┌──────────────────────────────────────────────┐"),
    );
    console.log(
      chalk.bold.blue(`│         MINT COMPLETED (${duration}s)          │`),
    );
    console.log(
      chalk.bold.blue("└──────────────────────────────────────────────┘"),
    );
  } catch (error) {
    console.log("");
    printErrorBox("Mint failed");
    console.error(
      chalk.red(error instanceof Error ? error.message : String(error)),
    );
    console.log(
      chalk.yellow(
        "Check: mnemonic, balance, Blockfrost key, or contract logic.",
      ),
    );
  }
};

export const update = async () => {
  const startTime = Date.now();
  printHeader("CẬP NHẬT METADATA THÙNG HÀNG");

  try {
    const contract = new Contract({
      wallet,
      provider,
      owners,
    });

    console.log(chalk.cyan("PolicyId:"), chalk.gray(contract.policyId));
    console.log(chalk.cyan("Asset:"), chalk.whiteBright(ASSET_NAME_UTF8));
    console.log(chalk.cyan("Asset Name (hex):"), chalk.gray(ASSET_NAME_HEX));
    console.log("");

    console.log(chalk.yellow("Preparing updated metadata..."));
    const newMetadata = buildContainerUpdateMetadata(owners);

    console.log(chalk.green("✓ Metadata ready"));
    console.log(chalk.dim(`Chuỗi địa điểm: ${newMetadata.participant_location_labels}`));
    console.log(
      chalk.dim(
        `Người ký: ${newMetadata.signer_location_label || "—"} (${newMetadata.signer_role || "—"})`,
      ),
    );
    console.log("");

    console.log(chalk.yellow("Building update transaction..."));
    const unsignedTx = await contract.update({
      assetName: ASSET_NAME_UTF8,
      metadata: newMetadata,
    });
    console.log(chalk.green("✓ Unsigned tx created"));
    console.log("");

    console.log(chalk.yellow("Signing transaction..."));
    const signedTx = await wallet.signTx(unsignedTx, true);
    console.log(chalk.green("✓ Signed successfully"));
    console.log("");

    console.log(chalk.yellow("Submitting to network..."));
    const txHash = await wallet.submitTx(signedTx);
    console.log(chalk.green("✓ Tx submitted!"));
    console.log("");
    console.log(chalk.bold.magenta("Tx Hash:"), chalk.whiteBright(txHash));
    console.log(
      chalk.cyan("Explorer:"),
      chalk.underline(`https://preprod.cexplorer.io/tx/${txHash}`),
    );
    console.log("");

    console.log(chalk.yellow("Awaiting confirmation..."));
    await waitForConfirmation(txHash);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      chalk.bold.blue("┌──────────────────────────────────────────────┐"),
    );
    console.log(
      chalk.bold.blue(`│      UPDATE COMPLETED (${duration}s)         │`),
    );
    console.log(
      chalk.bold.blue("└──────────────────────────────────────────────┘"),
    );
  } catch (error) {
    console.log("");
    printErrorBox("Update failed");
    console.error(
      chalk.red(error instanceof Error ? error.message : String(error)),
    );
    console.log(
      chalk.yellow("Check: ownership, balance, or contract permissions."),
    );
  }
};

export const burn = async () => {
  const startTime = Date.now();
  printHeader("BURN THÙNG HÀNG NFT");

  try {
    const contract = new Contract({
      wallet,
      provider,
      owners,
    });
    console.log(chalk.cyan("PolicyId:"), chalk.gray(contract.policyId));
    console.log(
      chalk.cyan("Asset to burn:"),
      chalk.whiteBright(ASSET_NAME_UTF8),
    );
    console.log(chalk.cyan("Asset Name (hex):"), chalk.gray(ASSET_NAME_HEX));
    console.log("");

    console.log(chalk.yellow("Building burn transaction..."));
    const unsignedTx = await contract.burn({
      assetName: ASSET_NAME_UTF8,
    });
    console.log(chalk.green("✓ Unsigned tx created"));
    console.log("");

    console.log(chalk.yellow("Signing burn transaction..."));
    const signedTx = await wallet.signTx(unsignedTx, true);
    console.log(chalk.green("✓ Signed successfully"));
    console.log("");

    console.log(chalk.yellow("Submitting burn tx..."));
    const txHash = await wallet.submitTx(signedTx);
    console.log(chalk.green("✓ Tx submitted!"));
    console.log("");
    console.log(chalk.bold.magenta("Tx Hash:"), chalk.whiteBright(txHash));
    console.log(
      chalk.cyan("Explorer:"),
      chalk.underline(`https://preprod.cexplorer.io/tx/${txHash}`),
    );
    console.log("");

    console.log(chalk.yellow("Awaiting confirmation..."));
    await waitForConfirmation(txHash);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      chalk.bold.blue("┌──────────────────────────────────────────────┐"),
    );
    console.log(
      chalk.bold.blue(`│        BURN COMPLETED (${duration}s)         │`),
    );
    console.log(
      chalk.bold.blue("└──────────────────────────────────────────────┘"),
    );
  } catch (error) {
    console.log("");
    printErrorBox("Burn failed");
    console.error(
      chalk.red(error instanceof Error ? error.message : String(error)),
    );
    console.log(
      chalk.yellow("Check: ownership, balance, or contract burn logic."),
    );
  }
};

export const queryTracking = async function () {
  printHeader("TRACKING NFT");

  try {
    const contract = new Contract({
      wallet,
      provider,
      owners,
    });

    const unit = contract.policyId + CIP68_100(stringToHex(ASSET_NAME_UTF8));

    console.log(chalk.cyan("PolicyId:"), chalk.gray(contract.policyId));
    console.log(chalk.cyan("Asset:"), chalk.whiteBright(ASSET_NAME_UTF8));
    console.log(chalk.cyan("Unit:"), chalk.gray(unit));
    console.log("");

    console.log(chalk.yellow("Fetching tracking data..."));

    const tracking = await getTracking({ unit });

    console.log(chalk.green("✓ Tracking loaded"));
    console.log("");

    console.log(
      chalk.bold.blue("┌──────────────────────────────────────────────┐"),
    );
    console.log(
      chalk.bold.blue("│              TRACKING RESULT                 │"),
    );
    console.log(
      chalk.bold.blue("└──────────────────────────────────────────────┘"),
    );

    console.log(chalk.green(JSON.stringify(tracking, null, 2)));
  } catch (error) {
    printErrorBox("Query tracking failed");

    console.error(
      chalk.red(error instanceof Error ? error.message : String(error)),
    );
  }
};

export const queryProduct = async function () {
  const product = await getProduct({
    owners: owners,
    assetName: ASSET_NAME_UTF8,
  });

  console.log(product);
};
