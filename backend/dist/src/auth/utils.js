"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAddress = normalizeAddress;
exports.isPaymentAddress = isPaymentAddress;
exports.hexToBech32Address = hexToBech32Address;
exports.normalizeStakeAddress = normalizeStakeAddress;
const bech32_1 = require("bech32");
function normalizeAddress(raw) {
    if (typeof raw === "string")
        return raw;
    if (raw && typeof raw.address === "string") {
        return raw.address;
    }
    return undefined;
}
function isPaymentAddress(addr) {
    const s = (addr || "").trim();
    return s.startsWith("addr_test1") || s.startsWith("addr1");
}
function hexToBech32Address(hex, network) {
    const raw = (hex || "").trim().toLowerCase();
    if (!/^[0-9a-f]+$/.test(raw))
        return null;
    const len = raw.length;
    let bytes;
    if (len === 56) {
        const pkh = Buffer.from(raw, "hex");
        const header = network === "mainnet" ? 0x21 : 0x20;
        bytes = Buffer.concat([Buffer.from([header]), pkh]);
    }
    else if (len === 58 || len === 114) {
        bytes = Buffer.from(raw, "hex");
    }
    else {
        return null;
    }
    try {
        const words = bech32_1.bech32.toWords(bytes);
        const hrp = network === "mainnet" ? "addr" : "addr_test";
        return bech32_1.bech32.encode(hrp, words, 1000);
    }
    catch (_a) {
        return null;
    }
}
function normalizeStakeAddress(stakeAddress, network) {
    let addr = (stakeAddress || "").trim();
    if (!isPaymentAddress(addr)) {
        const fromHex = hexToBech32Address(addr, network);
        if (fromHex)
            addr = fromHex;
    }
    return addr;
}
//# sourceMappingURL=utils.js.map