import "dotenv/config";
import { blockfrostProvider, blockfrostFetcher } from "@app/cardano/standalone";
import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { deserializeAddress, MeshWallet, resolvePaymentKeyHash, stringToHex, cst } from "@meshsdk/core";
import type { UTxO } from "@meshsdk/core";
import { readFileSync } from "fs";
import { join } from "path";
import { MultisigContract } from "@app/multisig/multisig.contract";
import { Cip68Contract } from "@app/cip68/cip68.contract";
import type { Plutus } from "@app/types";
import { buildRef100Unit, datumToJson, getPkHash } from "@app/cip68/utils";

const APP_WORDS =
  process.env.APP_MNEMONIC?.trim()?.split(" ").filter(Boolean) ?? [];
const USER_WORDS =
  process.env.USER_MNEMONIC?.trim()?.split(" ").filter(Boolean) ?? [];
const E_WORDS =
  process.env.E_MNEMONIC?.trim()?.split(" ").filter(Boolean) ?? [];
const LEAF_WORDS =
  process.env.LEAF?.trim()?.split(" ").filter(Boolean) ?? [];
const hasAppWallet = APP_WORDS.length >= 15;
const hasUserWallet = USER_WORDS.length >= 15;
const hasEWallet = E_WORDS.length >= 15; // ví E: set E_MNEMONIC (hoặc E_ADDRESS) nếu dùng 2-of-2
const hasLeafWallet = LEAF_WORDS.length >= 15;

// Địa chỉ ví E (bech32): set E_ADDRESS trong .env nếu chỉ có địa chỉ mà không có E_MNEMONIC
const E_ADDRESS = process.env.E_ADDRESS?.trim() ?? "addr_test1qr9ql9xgnntlwrtqklw8uand62usxq6y4gknrta58m8r0dcswr2qa03gpcus5s630ncctdjfjg7x4f802zqfy0xd9mlqndztal";

// Lock/Unlock NFT + ADA: dùng policyId từ Cip68Contract (cùng plutus với Traceability). Nếu set MULTISIG_NFT_POLICY_ID thì dùng giá trị đó. Nếu set MULTISIG_NFT_ASSET_NAME thì dùng đúng tên asset đã mint (vd: C2VN-xxx), không phải metadata.name "Cam sành XNK".
// Unit NFT 222 = policyId + "000de140" + hex(assetName); cip68.contract dùng stringToHex(assetName) (UTF-8 → hex).
const CIP68_LABEL_222 = "000de140";
const MULTISIG_NFT_POLICY_ID = process.env.MULTISIG_NFT_POLICY_ID?.trim() ?? "df7339e888a9b8d33302f6eda9e4cfb02fb37057cee7b25a64fd6276";
const MULTISIG_NFT_ASSET_NAME = process.env.MULTISIG_NFT_ASSET_NAME?.trim() ?? "chuoitim-mm73raz2-thzr3s";

/** Nếu set MULTISIG_PLUTUS_PATH thì dùng plutus đó (Lock/Unlock phải cùng script). Có thể set MULTISIG_VALIDATOR_TITLE (vd multi_sig_wallet.multisig.spend). */
function getMultisigContractOpts(): { plutus?: Plutus; validatorTitle?: string } {
  const path = process.env.MULTISIG_PLUTUS_PATH?.trim();
  if (!path) return {};
  const fullPath = path.startsWith("/") ? path : join(process.cwd(), path);
  const plutus = JSON.parse(readFileSync(fullPath, "utf-8")) as Plutus;
  const title = process.env.MULTISIG_VALIDATOR_TITLE?.trim();
  const hasAlt = plutus.validators?.some((v: { title: string }) => v.title === "multi_sig_wallet.multisig.spend");
  return { plutus, validatorTitle: title || (hasAlt ? "multi_sig_wallet.multisig.spend" : undefined) };
}

/** Unit NFT CIP68 (label 222): policyId + 000de140 + stringToHex(assetName). Khớp với cip68.contract.ts. */
function nftUnitFromPolicyAndName(policyId: string, assetName: string): string {
  if (!policyId || !assetName) return "";
  const hexName =
    assetName.startsWith("hex:") && assetName.length > 4
      ? assetName.slice(4)
      : stringToHex(assetName);
  return policyId + CIP68_LABEL_222 + hexName;
}

/** Tìm unit NFT 222 trong ví: ưu tiên unit từ MULTISIG_NFT_ASSET_NAME (nếu set), không thì lấy bất kỳ unit nào có prefix policyId + 000de140. */
function findNft222UnitInUtxos(
  utxos: UTxO[],
  policyId: string,
  explicitAssetName: string
): string | null {
  const prefix = policyId + CIP68_LABEL_222;
  const byExplicit =
    explicitAssetName
      ? nftUnitFromPolicyAndName(policyId, explicitAssetName)
      : "";

  for (const u of utxos) {
    for (const a of u.output.amount) {
      if (a.unit === "lovelace") continue;
      if (byExplicit) {
        if (a.unit === byExplicit) return a.unit;
        continue;
      }
      if (a.unit.startsWith(prefix) && a.unit.length > policyId.length + CIP68_LABEL_222.length)
        return a.unit;
    }
  }
  return null;
}

/** Tìm UTxO tại script có chứa NFT 222. Nếu truyền nftUnit thì chỉ lấy UTxO chứa đúng unit đó; không thì lấy bất kỳ (prefix policyId + 000de140). */
function findScriptUtxoWithNft222(
  scriptUtxos: UTxO[],
  policyId: string,
  nftUnitOrEmpty?: string
): UTxO | undefined {
  const prefix = policyId + CIP68_LABEL_222;
  if (nftUnitOrEmpty) {
    return scriptUtxos.find((u) =>
      u.output.amount.some((a) => a.unit === nftUnitOrEmpty)
    );
  }
  return scriptUtxos.find((u) =>
    u.output.amount.some(
      (a) => a.unit !== "lovelace" && a.unit.startsWith(prefix) && a.unit.length > prefix.length
    )
  );
}

/** Lấy pkE (hex) từ E_MNEMONIC hoặc E_ADDRESS. */
async function getPkE(): Promise<string | null> {
  if (hasEWallet && E_WORDS.length >= 15) {
    const walletE = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: { type: "mnemonic", words: E_WORDS },
    });
    const addrE = await walletE.getChangeAddress();
    return deserializeAddress(addrE).pubKeyHash;
  }
  if (E_ADDRESS) return resolvePaymentKeyHash(E_ADDRESS);
  return null;
}

/** Lấy pkLeaf (hex) từ LEAF (mnemonic). */
async function getPkLeaf(): Promise<string | null> {
  if (hasLeafWallet && LEAF_WORDS.length >= 15) {
    const walletLeaf = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: { type: "mnemonic", words: LEAF_WORDS },
    });
    const addrLeaf = await walletLeaf.getChangeAddress();
    return deserializeAddress(addrLeaf).pubKeyHash;
  }
  return null;
}

/** Lấy pk minter thật từ datum Ref100 của NFT (sử dụng metadata._pk hoặc getPkHash). */
async function getMinterPkFromRef100(policyId: string, assetName: string): Promise<string> {
  const refUnit = buildRef100Unit(policyId, assetName);
  const txList = await blockfrostFetcher.fetchAssetTransactions(refUnit);
  if (!Array.isArray(txList) || txList.length === 0) {
    throw new Error(`Không tìm thấy giao dịch cho Ref100 unit: ${refUnit}`);
  }
  const firstTxHash = (txList[0] as { tx_hash: string }).tx_hash;
  const txUtxos = await blockfrostFetcher.fetchTransactionsUTxO(firstTxHash);
  const outputs = (txUtxos as { outputs?: any[] }).outputs ?? [];
  const outputWithUnit = outputs.find((o: any) =>
    o.amount?.some((a: { unit: string }) => a.unit === refUnit)
  );
  if (!outputWithUnit || !outputWithUnit.inline_datum) {
    throw new Error("Không tìm thấy inline datum cho Ref100");
  }
  const datum = String(outputWithUnit.inline_datum);
  const meta = (await datumToJson(datum, { contain_pk: true })) as Record<string, string>;
  const minterPk = meta._pk ?? (await getPkHash(datum)) ?? "";
  if (!minterPk) {
    throw new Error("Không lấy được pk minter từ datum Ref100");
  }
  return minterPk;
}

describe("Multisig - Lock", function () {
  let wallet: MeshWallet;
  let contract: MultisigContract;

  beforeEach(async function () {
    wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: { type: "mnemonic", words: USER_WORDS },
    });
    contract = new MultisigContract();
  });
  jest.setTimeout(60000);

  test("Lock", async function () {
    expect(hasUserWallet).toBe(true);

    const changeAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    expect(utxos.length).toBeGreaterThan(0);

    let policyId: string;
    if (MULTISIG_NFT_POLICY_ID) {
      policyId = MULTISIG_NFT_POLICY_ID;
    } else {
      const cip68 = new Cip68Contract({ wallet });
      await cip68.init();
      policyId = cip68.policyId!;
    }
    expect(policyId).toBeTruthy();

    const nftUnit = findNft222UnitInUtxos(utxos, policyId, MULTISIG_NFT_ASSET_NAME);
    if (!nftUnit) {
      const prefix = policyId + CIP68_LABEL_222;
      const sample = utxos.flatMap((u) => u.output.amount.map((a) => a.unit)).filter((u) => u !== "lovelace").slice(0, 5);
      throw new Error(
        `Ví không có NFT 222 (policyId + 000de140). Chạy test Traceability mint trước. Prefix cần: ${prefix.slice(0, 24)}... Các unit trong ví (mẫu): ${sample.join(", ") || "không có"}`
      );
    }

    const scriptAddress = contract.getScriptAddress();

    // Danh sách owners cố định theo địa chỉ yêu cầu
    const ownersPkh = [
      resolvePaymentKeyHash(
        "addr_test1qrplj973a94sz46jqhfdmr87r9jngdw3ec2e3vygedquu0mhmfn5pu6rc4ynwh4p4ssxdjy7tdp6m27ggkq8ym0jlvgqqset5j"
      ),
      resolvePaymentKeyHash(
        "addr_test1qr9ql9xgnntlwrtqklw8uand62usxq6y4gknrta58m8r0dcswr2qa03gpcus5s630ncctdjfjg7x4f802zqfy0xd9mlqndztal"
      ),
      resolvePaymentKeyHash(
        "addr_test1qqexzg0fv0g3hdrhgng620tx09s6rgr3m29njh6mwdc6csvga0grgdn397050dkwm6xkh5snhdeuw2xq30wydcv67vnszvde8g"
      ),
    ];
    const threshold = ownersPkh.length; // tất cả owner phải ký

    const assets = [
      { unit: "lovelace", quantity: "2000000" },
      { unit: nftUnit, quantity: "1" },
    ];

    // Người nhận NFT: ví E mặc định (trong chuỗi traceability của Ref100).
    const recipientPkh = resolvePaymentKeyHash(E_ADDRESS);

    const unsignedLock = await contract.buildLockTx({
      scriptAddress,
      ownersPkh,
      threshold,
      recipientPkh,
      assets,
      changeAddress,
      utxos,
    });
    const signedLock = await wallet.signTx(unsignedLock);
    const lockTxHash = await wallet.submitTx(signedLock);
    expect(lockTxHash).toHaveLength(64);
    console.log("Lock tx:", lockTxHash);
  });
});

describe("Multisig - Unlock", function () {
  let wallet: MeshWallet;
  let contract: MultisigContract;

  beforeEach(async function () {
    wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: { type: "mnemonic", words: USER_WORDS },
    });
    const opts = getMultisigContractOpts();
    contract = new MultisigContract(opts);
  });
  jest.setTimeout(60000);
  test("Unlock", async function () {
    expect(hasUserWallet).toBe(true);

    const changeAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    const collaterals = await wallet.getCollateral();
    expect(utxos.length).toBeGreaterThan(0);
    expect(collaterals.length).toBeGreaterThan(0);

    let policyId: string;
    if (MULTISIG_NFT_POLICY_ID) {
      policyId = MULTISIG_NFT_POLICY_ID;
    } else {
      const cip68 = new Cip68Contract({ wallet });
      await cip68.init();
      policyId = cip68.policyId!;
    }
    expect(policyId).toBeTruthy();

    const pk = deserializeAddress(changeAddress).pubKeyHash;
    const scriptAddress = contract.getScriptAddress();
    const scriptUtxos = await blockfrostProvider.fetchAddressUTxOs(scriptAddress);

    const nftUnitToUnlock = MULTISIG_NFT_ASSET_NAME
      ? nftUnitFromPolicyAndName(policyId, MULTISIG_NFT_ASSET_NAME)
      : "";
    const ourUtxo = findScriptUtxoWithNft222(scriptUtxos, policyId, nftUnitToUnlock || undefined);
    expect(ourUtxo).toBeDefined();

    const lovelaceInScript = ourUtxo!.output.amount.find((a) => a.unit === "lovelace")?.quantity ?? "0";
    console.log("Script UTxO amount (lovelace):", lovelaceInScript, "→ Unlock gửi toàn bộ (2 ADA + NFT) về outputAddress");
    const datum = await contract.parseDatumFromUtxo(ourUtxo!);
    expect(datum.recipientPkh).toBeDefined();

    // Xác định owners thực tế từ datum và khớp với các ví mà ta có (APP, E_MNEMONIC, LEAF).
    const ownersFromDatum = datum.ownersPkh;
    expect(ownersFromDatum.length).toBeGreaterThan(0);

    const signingOwnersPkh: string[] = [];

    // USER (ví đang chạy test Unlock)
    if (ownersFromDatum.includes(pk)) {
      signingOwnersPkh.push(pk);
    }

    // APP (minter Ref100 thực tế, từ APP_MNEMONIC)
    let walletApp: MeshWallet | null = null;
    let pkApp: string | null = null;
    if (hasAppWallet && APP_WORDS.length >= 15) {
      walletApp = new MeshWallet({
        networkId: 0,
        fetcher: blockfrostProvider,
        submitter: blockfrostProvider,
        key: { type: "mnemonic", words: APP_WORDS },
      });
      const addrApp = await walletApp.getChangeAddress();
      pkApp = deserializeAddress(addrApp).pubKeyHash;
      if (ownersFromDatum.includes(pkApp)) {
        signingOwnersPkh.push(pkApp);
      }
    }

    // Ví E từ E_MNEMONIC
    let walletE: MeshWallet | null = null;
    let pkE: string | null = null;
    if (hasEWallet && E_WORDS.length >= 15) {
      walletE = new MeshWallet({
        networkId: 0,
        fetcher: blockfrostProvider,
        submitter: blockfrostProvider,
        key: { type: "mnemonic", words: E_WORDS },
      });
      const addrE = await walletE.getChangeAddress();
      pkE = deserializeAddress(addrE).pubKeyHash;
      if (ownersFromDatum.includes(pkE)) {
        signingOwnersPkh.push(pkE);
      }
    }

    // Ví Leaf từ LEAF (mnemonic riêng)
    let walletLeaf: MeshWallet | null = null;
    let pkLeaf: string | null = null;
    if (hasLeafWallet && LEAF_WORDS.length >= 15) {
      walletLeaf = new MeshWallet({
        networkId: 0,
        fetcher: blockfrostProvider,
        submitter: blockfrostProvider,
        key: { type: "mnemonic", words: LEAF_WORDS },
      });
      const addrLeaf = await walletLeaf.getChangeAddress();
      pkLeaf = deserializeAddress(addrLeaf).pubKeyHash;
      if (ownersFromDatum.includes(pkLeaf)) {
        signingOwnersPkh.push(pkLeaf);
      }
    }

    expect(signingOwnersPkh.length).toBeGreaterThanOrEqual(datum.threshold);

    // Chọn outputAddress đúng theo recipient trong datum
    let outputAddress = changeAddress;
    if (datum.recipientPkh === pk) {
      outputAddress = changeAddress;
    } else if (pkApp && datum.recipientPkh === pkApp && walletApp) {
      outputAddress = await walletApp.getChangeAddress();
    } else if (pkE && datum.recipientPkh === pkE) {
      if (walletE) {
        outputAddress = await walletE.getChangeAddress();
      } else if (E_ADDRESS) {
        outputAddress = E_ADDRESS;
      }
    } else if (pkLeaf && datum.recipientPkh === pkLeaf && walletLeaf) {
      outputAddress = await walletLeaf.getChangeAddress();
    }

    const unsignedUnlock = await contract.buildUnlockTx({
      scriptUtxo: ourUtxo!,
      outputAddress,
      signingOwnersPkh,
      threshold: datum.threshold,
      collateral: collaterals[0],
      changeAddress,
      utxos,
    });
    const txDecoded = cst.deserializeTx(unsignedUnlock);
    const reqSigners = txDecoded.body().requiredSigners();
    expect(reqSigners).toBeDefined();
    expect(reqSigners!.size()).toBeGreaterThanOrEqual(datum.threshold);
    let signedUnlock = await wallet.signTx(unsignedUnlock, signingOwnersPkh.length > 1);
    if (walletApp && pkApp && signingOwnersPkh.includes(pkApp)) {
      signedUnlock = await walletApp.signTx(signedUnlock, true);
    }
    if (walletE && pkE && signingOwnersPkh.includes(pkE)) {
      signedUnlock = await walletE.signTx(signedUnlock, true);
    }
    if (walletLeaf && pkLeaf && signingOwnersPkh.includes(pkLeaf)) {
      signedUnlock = await walletLeaf.signTx(signedUnlock, true);
    }
    const unlockTxHash = await wallet.submitTx(signedUnlock);
    expect(unlockTxHash).toHaveLength(64);
    console.log("Unlock tx:", unlockTxHash);
    console.log(
      "Unlock:",
      signingOwnersPkh.length,
      "chữ ký, output →",
      outputAddress === changeAddress ? "App" : "Leaf",
      outputAddress.slice(0, 20) + "..."
    );
  });
});
