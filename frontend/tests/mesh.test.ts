import { getProduct } from "@/actions/product";
import { getTracking } from "@/actions/tracking";
import { mint, update, burn } from "@/contract/scripts";

describe("Mint, Burn, Update, Remove Assets (NFT/TOKEN) CIP68", function () {
  jest.setTimeout(600000000);

  // test("Mint", async function () {
  //   await mint();
  // });

  // test("Update", async function () {
  //    await update()
  // });

  test("Burn", async function () {
     await burn()
  });

  // test("Product", async function () {
  //   const product = await getProduct({
  //     owners: [
  //       "addr_test1qrrsqzvu048737jnqq7rd3ck07e7cnk75x5wmdlt9zv7ptmqwvk3ckjxl4wcf6ehtynh8lctuu85xxdg9c8v5pfnjn4shn35yc",
  //       "addr_test1qryamep6l09mtjswn000l3jd79pls9pt5aj0nsf5cyfdp3xmj9k859jpvfpqepllgqn02473mlhttcf3lyujlpzhrk3qcndhyw",
  //       "addr_test1qrw7yktcc7wsscq46pfamt8t9yd2mlp7dtgjw3mq2hqplgvax05kaj8z5tgvtqd5q4xug4qqdgnzn2l8krm09c85f4psmzum9f",
  //       "addr_test1qztthppkvnl2k2gk96r6v22qxvwyymh4dr4njclae8wwau8d3tp4cyr8p83gs3vjnhmldj8vzhkx3cvnr80gjdfvdfdqcr2qz4",
  //     ],
  //     assetName: "Huawei Watch GT4 Pro",
  //   });
  //   console.log(product);
  // });

  // test("Transaction", async function () {
  //   const tracking = await getTracking({
  //     unit: "e27ba6f4dccecd0ab400519c7bb7fbd80a6011bc5f405e20c6e3a7a2000643b0487561776569205761746368204754342050726f",
  //   });
  //   console.dir(tracking, {
  //     depth: null,
  //     colors: true,
  //   });
  // });
});
