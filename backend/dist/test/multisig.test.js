"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const standalone_1 = require("../src/cardano/standalone");
const globals_1 = require("@jest/globals");
const core_1 = require("@meshsdk/core");
const fs_1 = require("fs");
const path_1 = require("path");
const multisig_contract_1 = require("../src/multisig/multisig.contract");
const cip68_contract_1 = require("../src/cip68/cip68.contract");
const utils_1 = require("../src/cip68/utils");
const APP_WORDS = (_c = (_b = (_a = process.env.APP_MNEMONIC) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.split(" ").filter(Boolean)) !== null && _c !== void 0 ? _c : [];
const USER_WORDS = (_f = (_e = (_d = process.env.USER_MNEMONIC) === null || _d === void 0 ? void 0 : _d.trim()) === null || _e === void 0 ? void 0 : _e.split(" ").filter(Boolean)) !== null && _f !== void 0 ? _f : [];
const E_WORDS = (_j = (_h = (_g = process.env.E_MNEMONIC) === null || _g === void 0 ? void 0 : _g.trim()) === null || _h === void 0 ? void 0 : _h.split(" ").filter(Boolean)) !== null && _j !== void 0 ? _j : [];
const LEAF_WORDS = (_m = (_l = (_k = process.env.LEAF) === null || _k === void 0 ? void 0 : _k.trim()) === null || _l === void 0 ? void 0 : _l.split(" ").filter(Boolean)) !== null && _m !== void 0 ? _m : [];
const hasAppWallet = APP_WORDS.length >= 15;
const hasUserWallet = USER_WORDS.length >= 15;
const hasEWallet = E_WORDS.length >= 15;
const hasLeafWallet = LEAF_WORDS.length >= 15;
const E_ADDRESS = (_p = (_o = process.env.E_ADDRESS) === null || _o === void 0 ? void 0 : _o.trim()) !== null && _p !== void 0 ? _p : "addr_test1qr9ql9xgnntlwrtqklw8uand62usxq6y4gknrta58m8r0dcswr2qa03gpcus5s630ncctdjfjg7x4f802zqfy0xd9mlqndztal";
const CIP68_LABEL_222 = "000de140";
const MULTISIG_NFT_POLICY_ID = (_r = (_q = process.env.MULTISIG_NFT_POLICY_ID) === null || _q === void 0 ? void 0 : _q.trim()) !== null && _r !== void 0 ? _r : "df7339e888a9b8d33302f6eda9e4cfb02fb37057cee7b25a64fd6276";
const MULTISIG_NFT_ASSET_NAME = (_t = (_s = process.env.MULTISIG_NFT_ASSET_NAME) === null || _s === void 0 ? void 0 : _s.trim()) !== null && _t !== void 0 ? _t : "chuoitim-mm73raz2-thzr3s";
function getMultisigContractOpts() {
    var _a, _b, _c;
    const path = (_a = process.env.MULTISIG_PLUTUS_PATH) === null || _a === void 0 ? void 0 : _a.trim();
    if (!path)
        return {};
    const fullPath = path.startsWith("/") ? path : (0, path_1.join)(process.cwd(), path);
    const plutus = JSON.parse((0, fs_1.readFileSync)(fullPath, "utf-8"));
    const title = (_b = process.env.MULTISIG_VALIDATOR_TITLE) === null || _b === void 0 ? void 0 : _b.trim();
    const hasAlt = (_c = plutus.validators) === null || _c === void 0 ? void 0 : _c.some((v) => v.title === "multi_sig_wallet.multisig.spend");
    return { plutus, validatorTitle: title || (hasAlt ? "multi_sig_wallet.multisig.spend" : undefined) };
}
function nftUnitFromPolicyAndName(policyId, assetName) {
    if (!policyId || !assetName)
        return "";
    const hexName = assetName.startsWith("hex:") && assetName.length > 4
        ? assetName.slice(4)
        : (0, core_1.stringToHex)(assetName);
    return policyId + CIP68_LABEL_222 + hexName;
}
function findNft222UnitInUtxos(utxos, policyId, explicitAssetName) {
    const prefix = policyId + CIP68_LABEL_222;
    const byExplicit = explicitAssetName
        ? nftUnitFromPolicyAndName(policyId, explicitAssetName)
        : "";
    for (const u of utxos) {
        for (const a of u.output.amount) {
            if (a.unit === "lovelace")
                continue;
            if (byExplicit) {
                if (a.unit === byExplicit)
                    return a.unit;
                continue;
            }
            if (a.unit.startsWith(prefix) && a.unit.length > policyId.length + CIP68_LABEL_222.length)
                return a.unit;
        }
    }
    return null;
}
function findScriptUtxoWithNft222(scriptUtxos, policyId, nftUnitOrEmpty) {
    const prefix = policyId + CIP68_LABEL_222;
    if (nftUnitOrEmpty) {
        return scriptUtxos.find((u) => u.output.amount.some((a) => a.unit === nftUnitOrEmpty));
    }
    return scriptUtxos.find((u) => u.output.amount.some((a) => a.unit !== "lovelace" && a.unit.startsWith(prefix) && a.unit.length > prefix.length));
}
async function getPkE() {
    if (hasEWallet && E_WORDS.length >= 15) {
        const walletE = new core_1.MeshWallet({
            networkId: 0,
            fetcher: standalone_1.blockfrostProvider,
            submitter: standalone_1.blockfrostProvider,
            key: { type: "mnemonic", words: E_WORDS },
        });
        const addrE = await walletE.getChangeAddress();
        return (0, core_1.deserializeAddress)(addrE).pubKeyHash;
    }
    if (E_ADDRESS)
        return (0, core_1.resolvePaymentKeyHash)(E_ADDRESS);
    return null;
}
async function getPkLeaf() {
    if (hasLeafWallet && LEAF_WORDS.length >= 15) {
        const walletLeaf = new core_1.MeshWallet({
            networkId: 0,
            fetcher: standalone_1.blockfrostProvider,
            submitter: standalone_1.blockfrostProvider,
            key: { type: "mnemonic", words: LEAF_WORDS },
        });
        const addrLeaf = await walletLeaf.getChangeAddress();
        return (0, core_1.deserializeAddress)(addrLeaf).pubKeyHash;
    }
    return null;
}
async function getMinterPkFromRef100(policyId, assetName) {
    var _a, _b, _c;
    const refUnit = (0, utils_1.buildRef100Unit)(policyId, assetName);
    const txList = await standalone_1.blockfrostFetcher.fetchAssetTransactions(refUnit);
    if (!Array.isArray(txList) || txList.length === 0) {
        throw new Error(`Không tìm thấy giao dịch cho Ref100 unit: ${refUnit}`);
    }
    const firstTxHash = txList[0].tx_hash;
    const txUtxos = await standalone_1.blockfrostFetcher.fetchTransactionsUTxO(firstTxHash);
    const outputs = (_a = txUtxos.outputs) !== null && _a !== void 0 ? _a : [];
    const outputWithUnit = outputs.find((o) => { var _a; return (_a = o.amount) === null || _a === void 0 ? void 0 : _a.some((a) => a.unit === refUnit); });
    if (!outputWithUnit || !outputWithUnit.inline_datum) {
        throw new Error("Không tìm thấy inline datum cho Ref100");
    }
    const datum = String(outputWithUnit.inline_datum);
    const meta = (await (0, utils_1.datumToJson)(datum, { contain_pk: true }));
    const minterPk = (_c = (_b = meta._pk) !== null && _b !== void 0 ? _b : (await (0, utils_1.getPkHash)(datum))) !== null && _c !== void 0 ? _c : "";
    if (!minterPk) {
        throw new Error("Không lấy được pk minter từ datum Ref100");
    }
    return minterPk;
}
(0, globals_1.describe)("Multisig - Lock", function () {
    let wallet;
    let contract;
    (0, globals_1.beforeEach)(async function () {
        wallet = new core_1.MeshWallet({
            networkId: 0,
            fetcher: standalone_1.blockfrostProvider,
            submitter: standalone_1.blockfrostProvider,
            key: { type: "mnemonic", words: USER_WORDS },
        });
        contract = new multisig_contract_1.MultisigContract();
    });
    globals_1.jest.setTimeout(60000);
    (0, globals_1.test)("Lock", async function () {
        (0, globals_1.expect)(hasUserWallet).toBe(true);
        const changeAddress = await wallet.getChangeAddress();
        const utxos = await wallet.getUtxos();
        (0, globals_1.expect)(utxos.length).toBeGreaterThan(0);
        let policyId;
        if (MULTISIG_NFT_POLICY_ID) {
            policyId = MULTISIG_NFT_POLICY_ID;
        }
        else {
            const cip68 = new cip68_contract_1.Cip68Contract({ wallet });
            await cip68.init();
            policyId = cip68.policyId;
        }
        (0, globals_1.expect)(policyId).toBeTruthy();
        const nftUnit = findNft222UnitInUtxos(utxos, policyId, MULTISIG_NFT_ASSET_NAME);
        if (!nftUnit) {
            const prefix = policyId + CIP68_LABEL_222;
            const sample = utxos.flatMap((u) => u.output.amount.map((a) => a.unit)).filter((u) => u !== "lovelace").slice(0, 5);
            throw new Error(`Ví không có NFT 222 (policyId + 000de140). Chạy test Traceability mint trước. Prefix cần: ${prefix.slice(0, 24)}... Các unit trong ví (mẫu): ${sample.join(", ") || "không có"}`);
        }
        const scriptAddress = contract.getScriptAddress();
        const ownersPkh = [
            (0, core_1.resolvePaymentKeyHash)("addr_test1qrplj973a94sz46jqhfdmr87r9jngdw3ec2e3vygedquu0mhmfn5pu6rc4ynwh4p4ssxdjy7tdp6m27ggkq8ym0jlvgqqset5j"),
            (0, core_1.resolvePaymentKeyHash)("addr_test1qr9ql9xgnntlwrtqklw8uand62usxq6y4gknrta58m8r0dcswr2qa03gpcus5s630ncctdjfjg7x4f802zqfy0xd9mlqndztal"),
            (0, core_1.resolvePaymentKeyHash)("addr_test1qqexzg0fv0g3hdrhgng620tx09s6rgr3m29njh6mwdc6csvga0grgdn397050dkwm6xkh5snhdeuw2xq30wydcv67vnszvde8g"),
        ];
        const threshold = ownersPkh.length;
        const assets = [
            { unit: "lovelace", quantity: "2000000" },
            { unit: nftUnit, quantity: "1" },
        ];
        const recipientPkh = (0, core_1.resolvePaymentKeyHash)(E_ADDRESS);
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
        (0, globals_1.expect)(lockTxHash).toHaveLength(64);
        console.log("Lock tx:", lockTxHash);
    });
});
(0, globals_1.describe)("Multisig - Unlock", function () {
    let wallet;
    let contract;
    (0, globals_1.beforeEach)(async function () {
        wallet = new core_1.MeshWallet({
            networkId: 0,
            fetcher: standalone_1.blockfrostProvider,
            submitter: standalone_1.blockfrostProvider,
            key: { type: "mnemonic", words: USER_WORDS },
        });
        const opts = getMultisigContractOpts();
        contract = new multisig_contract_1.MultisigContract(opts);
    });
    globals_1.jest.setTimeout(60000);
    (0, globals_1.test)("Unlock", async function () {
        var _a, _b;
        (0, globals_1.expect)(hasUserWallet).toBe(true);
        const changeAddress = await wallet.getChangeAddress();
        const utxos = await wallet.getUtxos();
        const collaterals = await wallet.getCollateral();
        (0, globals_1.expect)(utxos.length).toBeGreaterThan(0);
        (0, globals_1.expect)(collaterals.length).toBeGreaterThan(0);
        let policyId;
        if (MULTISIG_NFT_POLICY_ID) {
            policyId = MULTISIG_NFT_POLICY_ID;
        }
        else {
            const cip68 = new cip68_contract_1.Cip68Contract({ wallet });
            await cip68.init();
            policyId = cip68.policyId;
        }
        (0, globals_1.expect)(policyId).toBeTruthy();
        const pk = (0, core_1.deserializeAddress)(changeAddress).pubKeyHash;
        const scriptAddress = contract.getScriptAddress();
        const scriptUtxos = await standalone_1.blockfrostProvider.fetchAddressUTxOs(scriptAddress);
        const nftUnitToUnlock = MULTISIG_NFT_ASSET_NAME
            ? nftUnitFromPolicyAndName(policyId, MULTISIG_NFT_ASSET_NAME)
            : "";
        const ourUtxo = findScriptUtxoWithNft222(scriptUtxos, policyId, nftUnitToUnlock || undefined);
        (0, globals_1.expect)(ourUtxo).toBeDefined();
        const lovelaceInScript = (_b = (_a = ourUtxo.output.amount.find((a) => a.unit === "lovelace")) === null || _a === void 0 ? void 0 : _a.quantity) !== null && _b !== void 0 ? _b : "0";
        console.log("Script UTxO amount (lovelace):", lovelaceInScript, "→ Unlock gửi toàn bộ (2 ADA + NFT) về outputAddress");
        const datum = await contract.parseDatumFromUtxo(ourUtxo);
        (0, globals_1.expect)(datum.recipientPkh).toBeDefined();
        const ownersFromDatum = datum.ownersPkh;
        (0, globals_1.expect)(ownersFromDatum.length).toBeGreaterThan(0);
        const signingOwnersPkh = [];
        if (ownersFromDatum.includes(pk)) {
            signingOwnersPkh.push(pk);
        }
        let walletApp = null;
        let pkApp = null;
        if (hasAppWallet && APP_WORDS.length >= 15) {
            walletApp = new core_1.MeshWallet({
                networkId: 0,
                fetcher: standalone_1.blockfrostProvider,
                submitter: standalone_1.blockfrostProvider,
                key: { type: "mnemonic", words: APP_WORDS },
            });
            const addrApp = await walletApp.getChangeAddress();
            pkApp = (0, core_1.deserializeAddress)(addrApp).pubKeyHash;
            if (ownersFromDatum.includes(pkApp)) {
                signingOwnersPkh.push(pkApp);
            }
        }
        let walletE = null;
        let pkE = null;
        if (hasEWallet && E_WORDS.length >= 15) {
            walletE = new core_1.MeshWallet({
                networkId: 0,
                fetcher: standalone_1.blockfrostProvider,
                submitter: standalone_1.blockfrostProvider,
                key: { type: "mnemonic", words: E_WORDS },
            });
            const addrE = await walletE.getChangeAddress();
            pkE = (0, core_1.deserializeAddress)(addrE).pubKeyHash;
            if (ownersFromDatum.includes(pkE)) {
                signingOwnersPkh.push(pkE);
            }
        }
        let walletLeaf = null;
        let pkLeaf = null;
        if (hasLeafWallet && LEAF_WORDS.length >= 15) {
            walletLeaf = new core_1.MeshWallet({
                networkId: 0,
                fetcher: standalone_1.blockfrostProvider,
                submitter: standalone_1.blockfrostProvider,
                key: { type: "mnemonic", words: LEAF_WORDS },
            });
            const addrLeaf = await walletLeaf.getChangeAddress();
            pkLeaf = (0, core_1.deserializeAddress)(addrLeaf).pubKeyHash;
            if (ownersFromDatum.includes(pkLeaf)) {
                signingOwnersPkh.push(pkLeaf);
            }
        }
        (0, globals_1.expect)(signingOwnersPkh.length).toBeGreaterThanOrEqual(datum.threshold);
        let outputAddress = changeAddress;
        if (datum.recipientPkh === pk) {
            outputAddress = changeAddress;
        }
        else if (pkApp && datum.recipientPkh === pkApp && walletApp) {
            outputAddress = await walletApp.getChangeAddress();
        }
        else if (pkE && datum.recipientPkh === pkE) {
            if (walletE) {
                outputAddress = await walletE.getChangeAddress();
            }
            else if (E_ADDRESS) {
                outputAddress = E_ADDRESS;
            }
        }
        else if (pkLeaf && datum.recipientPkh === pkLeaf && walletLeaf) {
            outputAddress = await walletLeaf.getChangeAddress();
        }
        const unsignedUnlock = await contract.buildUnlockTx({
            scriptUtxo: ourUtxo,
            outputAddress,
            signingOwnersPkh,
            threshold: datum.threshold,
            collateral: collaterals[0],
            changeAddress,
            utxos,
        });
        const txDecoded = core_1.cst.deserializeTx(unsignedUnlock);
        const reqSigners = txDecoded.body().requiredSigners();
        (0, globals_1.expect)(reqSigners).toBeDefined();
        (0, globals_1.expect)(reqSigners.size()).toBeGreaterThanOrEqual(datum.threshold);
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
        (0, globals_1.expect)(unlockTxHash).toHaveLength(64);
        console.log("Unlock tx:", unlockTxHash);
        console.log("Unlock:", signingOwnersPkh.length, "chữ ký, output →", outputAddress === changeAddress ? "App" : "Leaf", outputAddress.slice(0, 20) + "...");
    });
});
//# sourceMappingURL=multisig.test.js.map