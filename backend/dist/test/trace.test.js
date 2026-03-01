"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const globals_1 = require("@jest/globals");
const standalone_1 = require("../src/cardano/standalone");
const config_service_1 = require("../src/config/config.service");
const POLICY_ID = "df7339e888a9b8d33302f6eda9e4cfb02fb37057cee7b25a64fd6276";
const PREFIX_REF100 = config_service_1.CIP68_PREFIX.REFERENCE_100;
const PREFIX_222 = config_service_1.CIP68_PREFIX.USER_222;
function hexToUtf8(hex) {
    try {
        return Buffer.from(hex, "hex").toString("utf8");
    }
    catch (_a) {
        return hex;
    }
}
function assetNameFromUnit(policyId, unit) {
    if (!unit.startsWith(policyId) || unit.length <= policyId.length + 8)
        return null;
    const afterPolicy = unit.slice(policyId.length);
    const prefix = afterPolicy.slice(0, 8);
    const hexName = afterPolicy.slice(8);
    if (!hexName)
        return { prefix, name: "" };
    return { prefix, name: hexToUtf8(hexName) };
}
async function listAssetsByPolicy(policyId) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const fetcher = (0, standalone_1.getBlockfrostFetcher)();
    const raw = await fetcher.fetchAssetsByPolicy(policyId);
    const byLogicalName = new Map();
    for (const { asset: unit, quantity } of raw) {
        if (!unit.startsWith(policyId))
            continue;
        const parsed = assetNameFromUnit(policyId, unit);
        if (!parsed)
            continue;
        const { prefix, name } = parsed;
        if (prefix === PREFIX_REF100) {
            let row = byLogicalName.get(name);
            if (!row) {
                row = {};
                byLogicalName.set(name, row);
            }
            row.ref100 = { unit, quantity };
        }
        else if (prefix === PREFIX_222) {
            let row = byLogicalName.get(name);
            if (!row) {
                row = {};
                byLogicalName.set(name, row);
            }
            row.nft222 = { unit, quantity };
        }
    }
    const rows = [];
    for (const [assetName, row] of byLogicalName.entries()) {
        rows.push({
            assetName,
            ref100Unit: (_b = (_a = row.ref100) === null || _a === void 0 ? void 0 : _a.unit) !== null && _b !== void 0 ? _b : null,
            ref100Quantity: (_d = (_c = row.ref100) === null || _c === void 0 ? void 0 : _c.quantity) !== null && _d !== void 0 ? _d : "0",
            nft222Unit: (_f = (_e = row.nft222) === null || _e === void 0 ? void 0 : _e.unit) !== null && _f !== void 0 ? _f : null,
            nft222Quantity: (_h = (_g = row.nft222) === null || _g === void 0 ? void 0 : _g.quantity) !== null && _h !== void 0 ? _h : "0",
        });
    }
    rows.sort((a, b) => a.assetName.localeCompare(b.assetName));
    return rows;
}
(0, globals_1.describe)("Trace – list assets by policy", function () {
    (0, globals_1.test)("Nhập policy ID → trả về hết assetName và Ref100 (và NFT 222)", async function () {
        var _a, _b;
        const rows = await listAssetsByPolicy(POLICY_ID);
        console.log("\n=== Policy:", POLICY_ID);
        console.log("Tổng số asset name (logical):", rows.length);
        console.log("");
        for (const r of rows) {
            console.log("Asset name:", r.assetName);
            console.log("  Ref100:", (_a = r.ref100Unit) !== null && _a !== void 0 ? _a : "—", "qty:", r.ref100Quantity);
            console.log("  NFT222:", (_b = r.nft222Unit) !== null && _b !== void 0 ? _b : "—", "qty:", r.nft222Quantity);
            console.log("");
        }
        (0, globals_1.expect)(Array.isArray(rows)).toBe(true);
    });
});
//# sourceMappingURL=trace.test.js.map