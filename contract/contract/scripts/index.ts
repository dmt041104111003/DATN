import chalk from "chalk";
import {
  BlockfrostProvider,
  CIP68_100,
  MeshWallet,
  stringToHex,
} from "@meshsdk/core";

import { Contract } from "./offchain";
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

/*
addr_test1qrr879mjnxd3gjqjdgjxkwzfcnvcgsve927scqk5fc3gfs2hs03pn7uhujentyhzq3ays72u4xtfrlahyjalujhxufsqdeezc0,
addr_test1qp0fadkx80g75f35g5v3pevqganc40hw4vq8r6tq8g447mt0rkz2wztnaf7rkua8g2u59g350daeygnv64u99zsdke9qeyltl6,
addr_test1qpcfnnmwxhmtu44mzv4y88c6mmzgq9dc7pegdx53j0u4ku2fpl9ex2pe8r74g8twdwgplxgwseqlzctf5m5hfv3r774qk3ths8,
addr_test1qpvwy8auzdjkqlt9rg0t72dvdv2rrgw94m38um4kwnsgs6hp5j4rzy6jy0wg5cfufja7jetwwl50858nerwkf3sxzucsrxycjw
*/

const owners: Array<string> = [
  "addr_test1qrr879mjnxd3gjqjdgjxkwzfcnvcgsve927scqk5fc3gfs2hs03pn7uhujentyhzq3ays72u4xtfrlahyjalujhxufsqdeezc0",
  "addr_test1qp0fadkx80g75f35g5v3pevqganc40hw4vq8r6tq8g447mt0rkz2wztnaf7rkua8g2u59g350daeygnv64u99zsdke9qeyltl6",
  "addr_test1qpcfnnmwxhmtu44mzv4y88c6mmzgq9dc7pegdx53j0u4ku2fpl9ex2pe8r74g8twdwgplxgwseqlzctf5m5hfv3r774qk3ths8",
  "addr_test1qpvwy8auzdjkqlt9rg0t72dvdv2rrgw94m38um4kwnsgs6hp5j4rzy6jy0wg5cfufja7jetwwl50858nerwkf3sxzucsrxycjw",
];

const ASSET_NAME_UTF8 = "Huawei Watch GT4 Pro";
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
  printHeader("MINT NEW PRODUCT NFT");

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
    const metadata = {
      name: "Huawei Watch GT 4 Pro - Premium Titanium Smartwatch",
      description:
        "The Huawei Watch GT 4 Pro is a high-end smartwatch featuring an aerospace-grade titanium case, spherical sapphire crystal glass, and a 1.5-inch LTPO AMOLED display (466×466 pixels, ~310 ppi). It offers up to 14 days of battery life (typical usage), HUAWEI TruSense health system (heart rate, SpO2, ECG, stress, sleep, skin temperature), 100+ sports modes, dual-band multi-system GPS, 5 ATM water resistance (50 meters), HarmonyOS, Bluetooth 5.2, NFC, and premium design for active, modern lifestyles.",
      brand: "Huawei",
      model: "Watch GT 4 Pro",
      material: "Aerospace Titanium + Sapphire Glass",
      battery: "Up to 14 days",
      image: "ipfs://QmYourIPFSHashhuaweiwatchgt4frontpng",
      mediaType: "image/png",
      roadmap: "[Viet Nam, China, American, Russia]",
      location: "Viet Nam",
    };

    console.log(chalk.green("✓ Metadata prepared"));
    console.log(chalk.dim(`Initial location: ${metadata.location}`));
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
  printHeader("UPDATE PRODUCT METADATA");

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
    const newMetadata = {
      name: "Huawei Watch GT 4 Pro",
      description:
        "The Huawei Watch GT 4 Pro is a high-end smartwatch featuring an aerospace-grade titanium case, spherical sapphire crystal glass, and a 1.5-inch LTPO AMOLED display (466×466 pixels, ~310 ppi). It offers up to 14 days of battery life (typical usage), HUAWEI TruSense health system (heart rate, SpO2, ECG, stress, sleep, skin temperature), 100+ sports modes, dual-band multi-system GPS, 5 ATM water resistance (50 meters), HarmonyOS, Bluetooth 5.2, NFC, and premium design for active, modern lifestyles.",
      brand: "Huawei",
      model: "Watch GT 4 Pro",
      material: "Aerospace Titanium + Sapphire Glass",
      battery: "Up to 14 days",
      image: "ipfs://QmYourIPFSHashhuaweiwatchgt4frontpng",
      mediaType: "image/png",
      roadmap: "[Viet Nam, China, American, Russia]",
      location: "China",
    };

    console.log(chalk.green("✓ Metadata ready"));
    console.log(chalk.dim(`New location: ${newMetadata.location}`));
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
  printHeader("BURN PRODUCT NFT");

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
