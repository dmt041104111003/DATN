"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const standalone_1 = require("../src/core/cardano/standalone");
const globals_1 = require("@jest/globals");
const core_1 = require("@meshsdk/core");
const cip68_contract_1 = require("../src/core/cardano/cip68/cip68.contract");
const APP_WORDS = (_c = (_b = (_a = process.env.APP_MNEMONIC) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.split(" ").filter(Boolean)) !== null && _c !== void 0 ? _c : [];
const hasAppWallet = APP_WORDS.length >= 15;
const ASSET_NAME_BASE = process.env.TRACE_ASSET_NAME || "C2VN";
function uniqueAssetName() {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    return `${ASSET_NAME_BASE}-${id}`;
}
let lastMintedAssetName = null;
function assetNameForUpdateBurnRevoke() {
    return lastMintedAssetName !== null && lastMintedAssetName !== void 0 ? lastMintedAssetName : ASSET_NAME_BASE;
}
function buildBaseMetadata(opts) {
    const properties = {
        ngayHetHan: "2023-07-18T17:00:00Z",
        current_holder_id: opts.pk,
    };
    return {
        name: "Cam sành XNK 1.5kg",
        image: "ipfs://<hash_anh_dai_dien>",
        standard: "Traceability-v1",
        properties: JSON.stringify(properties),
        _pk: opts.pk,
        receivers: opts.receivers,
        receiver_locations: opts.receiver_locations,
        receiver_coordinates: opts.receiver_coordinates,
        minter_location: opts.minter_location,
        minter_coordinates: opts.minter_coordinates,
    };
}
const ADDRS_ABCD = [
    "addr_test1qrapvfpn272p8xnagzp3l8ws9gxag45jjc5fhvc3k3zl7clq89xhyg8yakc7ssqh94z2ep22a0zuurcl32uh9dfpuz4qq6gh9h",
    "addr_test1qqafdgky3jcvrc4xh4q4wdagknv76wt5fwphdmnz9eepsvjeskukyazzw005gkdtwc97dpe7jspsjmajvq2yg0marl3sx5qsg8",
    "addr_test1qpeaqq3s0ag864myxmesz2rac6ue5vql9nlu8wk59g0r6q2x34a8zqcsm3jmvldx3q38zszvjkegq7jgmynf0humftlscjn9dd",
    "addr_test1qz9m2s2xg0h76nf4fd6ypuytqx2668ss50ge08d5gm6u8ehv737fy64mkvnztz90segmx4ekg2rkqusmp4td665gmnysyvx69a",
];
const ADDR_E = "addr_test1qqexzg0fv0g3hdrhgng620tx09s6rgr3m29njh6mwdc6csvga0grgdn397050dkwm6xkh5snhdeuw2xq30wydcv67vnszvde8g";
(0, globals_1.describe)("CIP68 - Reference 100 + NFT 222", function () {
    let wallet;
    (0, globals_1.beforeEach)(async function () {
        wallet = new core_1.MeshWallet({
            networkId: 0,
            fetcher: standalone_1.blockfrostProvider,
            submitter: standalone_1.blockfrostProvider,
            key: { type: "mnemonic", words: APP_WORDS },
        });
    });
    globals_1.jest.setTimeout(60000);
    (0, globals_1.describe)("Mint", function () {
        return;
        (0, globals_1.test)("Mint 1 Reference (100) + 1 NFT (222) với metadata receivers A,B,C,D", async function () {
            if (!hasAppWallet) {
                console.log("Skip: set APP_MNEMONIC để chạy test mint.");
                return;
            }
            const cip68Contract = new cip68_contract_1.Cip68Contract({ wallet });
            const changeAddr = await wallet.getChangeAddress();
            const pk = (0, core_1.deserializeAddress)(changeAddr).pubKeyHash;
            const receivers = ADDRS_ABCD.map((addr) => (0, core_1.resolvePaymentKeyHash)(addr)).join(",");
            const receiver_locations = "Trung chuyển A; Trung chuyển B; Trung chuyển C; Đại lý D";
            const receiver_coordinates = "21.0285,105.8542;16.0544,108.2022;10.8231,106.6297;10.0452,105.7469";
            const minter_location = "Điểm gốc (minter)";
            const minter_coordinates = "21.0285,105.8542";
            const baseMetadata = buildBaseMetadata({
                pk,
                receivers,
                receiver_locations,
                receiver_coordinates,
                minter_location,
                minter_coordinates,
            });
            const assetName = uniqueAssetName();
            lastMintedAssetName = assetName;
            const unsignedTx = await cip68Contract.mint([
                {
                    assetName,
                    metadata: baseMetadata,
                    quantity: "1",
                    receiver: changeAddr,
                },
            ]);
            const signedTx = await wallet.signTx(unsignedTx, true);
            const txHash = await wallet.submitTx(signedTx);
            console.log("Tx:", "https://preview.cexplorer.io/tx/" + txHash);
            console.log("Metadata.receivers (pk1,pk2,...):", receivers);
            console.log("Metadata.receiver_locations:", receiver_locations);
            console.log("Metadata.receiver_coordinates:", receiver_coordinates);
            console.log("Metadata.minter_location:", minter_location);
            console.log("Metadata.minter_coordinates:", minter_coordinates);
            (0, globals_1.expect)(txHash.length).toBe(64);
        });
    });
    (0, globals_1.describe)("Update", function () {
        return;
        (0, globals_1.test)("Update list địa chỉ (receivers) metadata Reference (100) tại Store", async function () {
            if (!hasAppWallet) {
                console.log("Skip: set APP_MNEMONIC để chạy test update.");
                return;
            }
            const cip68Contract = new cip68_contract_1.Cip68Contract({ wallet });
            const changeAddr = await wallet.getChangeAddress();
            const pk = (0, core_1.deserializeAddress)(changeAddr).pubKeyHash;
            const pksABCD = ADDRS_ABCD.map((addr) => (0, core_1.resolvePaymentKeyHash)(addr));
            const pkE = (0, core_1.resolvePaymentKeyHash)(ADDR_E);
            const receivers = [...pksABCD, pkE].join(",");
            const receiver_locations = "Trung chuyển A; Trung chuyển B; Trung chuyển C; Đại lý D; Trung chuyển E";
            const receiver_coordinates = "21.0285,105.8542;16.0544,108.2022;10.8231,106.6297;10.0452,105.7469;0,0";
            const unsignedTx = await cip68Contract.update([
                {
                    assetName: assetNameForUpdateBurnRevoke(),
                    metadata: buildBaseMetadata({
                        pk,
                        receivers,
                        receiver_locations,
                        receiver_coordinates,
                        minter_location: "Điểm gốc (minter)",
                        minter_coordinates: "21.0285,105.8542",
                    }),
                },
            ]);
            const signedTx = await wallet.signTx(unsignedTx, true);
            const txHash = await wallet.submitTx(signedTx);
            console.log("Tx:", "https://preview.cexplorer.io/tx/" + txHash);
            (0, globals_1.expect)(txHash.length).toBe(64);
        });
    });
    (0, globals_1.describe)("Update Ref100 (metadata/datum tại Store)", function () {
        return;
        (0, globals_1.test)("Update: thêm địa chỉ E vào receivers", async function () {
            if (!hasAppWallet) {
                console.log("Skip: set APP_MNEMONIC để chạy test update.");
                return;
            }
            const cip68Contract = new cip68_contract_1.Cip68Contract({ wallet });
            const changeAddr = await wallet.getChangeAddress();
            const pk = (0, core_1.deserializeAddress)(changeAddr).pubKeyHash;
            const pkE = (0, core_1.resolvePaymentKeyHash)(ADDR_E);
            const pksABCD = ADDRS_ABCD.map((addr) => (0, core_1.resolvePaymentKeyHash)(addr));
            const receivers = [...pksABCD, pkE].join(",");
            const receiver_locations = "Trung chuyển A; Trung chuyển B; Trung chuyển C; Đại lý D; Trung chuyển E";
            const receiver_coordinates = "21.0285,105.8542;16.0544,108.2022;10.8231,106.6297;10.0452,105.7469;0,0";
            const unsignedTx = await cip68Contract.update([
                {
                    assetName: assetNameForUpdateBurnRevoke(),
                    metadata: buildBaseMetadata({
                        pk,
                        receivers,
                        receiver_locations,
                        receiver_coordinates,
                        minter_location: "Điểm gốc (minter)",
                        minter_coordinates: "21.0285,105.8542",
                    }),
                },
            ]);
            const signedTx = await wallet.signTx(unsignedTx, true);
            const txHash = await wallet.submitTx(signedTx);
            console.log("Tx (thêm E):", "https://preview.cexplorer.io/tx/" + txHash);
            (0, globals_1.expect)(txHash.length).toBe(64);
        });
    });
    (0, globals_1.describe)("Update Ref100: xóa địa chỉ", function () {
        return;
        (0, globals_1.test)("Update: xóa địa chỉ (chỉ còn A, B, C — bỏ D)", async function () {
            if (!hasAppWallet) {
                console.log("Skip: set APP_MNEMONIC để chạy test update.");
                return;
            }
            const cip68Contract = new cip68_contract_1.Cip68Contract({ wallet });
            const changeAddr = await wallet.getChangeAddress();
            const pk = (0, core_1.deserializeAddress)(changeAddr).pubKeyHash;
            const [pkA, pkB, pkC] = ADDRS_ABCD.slice(0, 3).map((addr) => (0, core_1.resolvePaymentKeyHash)(addr));
            const receivers = [pkA, pkB, pkC].join(",");
            const receiver_locations = "Trung chuyển A; Trung chuyển B; Trung chuyển C";
            const receiver_coordinates = "21.0285,105.8542;16.0544,108.2022;10.8231,106.6297";
            const unsignedTx = await cip68Contract.update([
                {
                    assetName: assetNameForUpdateBurnRevoke(),
                    metadata: buildBaseMetadata({
                        pk,
                        receivers,
                        receiver_locations,
                        receiver_coordinates,
                        minter_location: "Điểm gốc (minter)",
                        minter_coordinates: "21.0285,105.8542",
                    }),
                },
            ]);
            const signedTx = await wallet.signTx(unsignedTx, true);
            const txHash = await wallet.submitTx(signedTx);
            console.log("Tx (xóa D):", "https://preview.cexplorer.io/tx/" + txHash);
            (0, globals_1.expect)(txHash.length).toBe(64);
        });
    });
    (0, globals_1.describe)("Burn NFT 222 (kiểm tra trong chuỗi / minter)", function () {
        return;
        (0, globals_1.test)("Burn NFT 222 trong chuỗi (receiver E burn, cần minterMintScriptCbor)", async function () {
            var _a, _b, _c;
            const userWords = (_c = (_b = (_a = process.env.E_MNEMONIC) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.split(" ").filter(Boolean)) !== null && _c !== void 0 ? _c : [];
            if (userWords.length < 15) {
                console.log("Skip: set E_MNEMONIC (ví E trong receivers, có NFT DEMO).");
                return;
            }
            const cip68App = new cip68_contract_1.Cip68Contract({ wallet });
            await cip68App.init();
            const minterMintScriptCbor = cip68App.getMintScriptCbor();
            if (!minterMintScriptCbor)
                throw new Error("Minter mint script not available");
            const walletUser = new core_1.MeshWallet({
                networkId: 0,
                fetcher: standalone_1.blockfrostProvider,
                submitter: standalone_1.blockfrostProvider,
                key: { type: "mnemonic", words: userWords },
            });
            const cip68User = new cip68_contract_1.Cip68Contract({ wallet: walletUser, minterMintScriptCbor });
            const unsignedTx = await cip68User.burn([{ assetName: assetNameForUpdateBurnRevoke(), quantity: "-1" }]);
            const signedTx = await walletUser.signTx(unsignedTx, true);
            const txHash = await walletUser.submitTx(signedTx);
            console.log("Burn trong chuỗi tx:", "https://preview.cexplorer.io/tx/" + txHash);
            (0, globals_1.expect)(txHash.length).toBe(64);
        });
    });
    (0, globals_1.describe)("Revoke", function () {
        return;
        (0, globals_1.test)("Revoke: gốc thu hồi Reference (100), không cần có NFT 222", async function () {
            if (!hasAppWallet) {
                console.log("Skip: set APP_MNEMONIC để chạy test revoke.");
                return;
            }
            const cip68Contract = new cip68_contract_1.Cip68Contract({ wallet });
            try {
                const unsignedTx = await cip68Contract.revoke([{ assetName: assetNameForUpdateBurnRevoke() }]);
                const signedTx = await wallet.signTx(unsignedTx, true);
                const txHash = await wallet.submitTx(signedTx);
                console.log("Tx:", "https://preview.cexplorer.io/tx/" + txHash);
                (0, globals_1.expect)(txHash.length).toBe(64);
            }
            catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                if (msg.includes("Store UTXO not found") || msg.includes("not found")) {
                    console.log("Skip: không tìm thấy Reference (100) tại Store (có thể đã revoke trước đó).");
                    return;
                }
                throw e;
            }
        });
    });
});
//# sourceMappingURL=traceability.test.js.map