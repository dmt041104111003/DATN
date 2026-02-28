"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMultisigDatumFromUtxo = parseMultisigDatumFromUtxo;
exports.getAllowedPkhsFromRef100ByNftUnit = getAllowedPkhsFromRef100ByNftUnit;
exports.assertRecipientAllowedByRef100 = assertRecipientAllowedByRef100;
const core_1 = require("@meshsdk/core");
const cbor_1 = require("cbor");
const config_service_1 = require("../config/config.service");
const standalone_1 = require("../cardano/standalone");
const utils_1 = require("../cip68/utils");
const multisig_types_1 = require("./multisig.types");
async function parseMultisigDatumFromUtxo(utxo) {
    var _a;
    const data = utxo.output.plutusData;
    if (!data) {
        throw new Error("UTxO has no plutusData");
    }
    if (typeof data !== "string") {
        const obj = data;
        if (Array.isArray(obj === null || obj === void 0 ? void 0 : obj.fields)) {
            const fields = obj.fields;
            if (fields.length >= 3) {
                const [owners, threshold, recipient] = fields;
                return {
                    ownersPkh: Array.isArray(owners)
                        ? owners.map((o) => typeof o === "string" ? o : String(o))
                        : [],
                    threshold: Number(threshold !== null && threshold !== void 0 ? threshold : 0),
                    recipientPkh: typeof recipient === "string" ? recipient : String(recipient),
                };
            }
        }
    }
    try {
        const buffer = Buffer.from(data, "hex");
        const decoded = await (0, cbor_1.decodeFirst)(buffer);
        const value = (_a = decoded === null || decoded === void 0 ? void 0 : decoded.value) !== null && _a !== void 0 ? _a : decoded;
        const raw = Array.isArray(value) ? value : [value];
        const fields = raw.length >= 4 && typeof raw[0] === "number"
            ? raw.slice(1)
            : raw.length >= 3
                ? raw
                : raw[0] != null && Array.isArray(raw[0])
                    ? raw[0]
                    : raw;
        if (!Array.isArray(fields) || fields.length < 3) {
            throw new Error("Invalid datum");
        }
        const toHex = (x) => Buffer.isBuffer(x) || x instanceof Uint8Array
            ? Buffer.from(x).toString("hex")
            : String(x);
        const ownersRaw = fields[0];
        const ownersPkh = Array.isArray(ownersRaw)
            ? ownersRaw.map((b) => toHex(b))
            : [];
        const result = {
            ownersPkh,
            threshold: Number(fields[1]) || 0,
            recipientPkh: toHex(fields[2]),
        };
        return result;
    }
    catch (e) {
        throw new Error(`Unsupported datum format: ${e instanceof Error ? e.message : String(e)}`);
    }
}
async function getAllowedPkhsFromRef100ByNftUnit(nftUnit222) {
    var _a, _b, _c, _d;
    if (!nftUnit222 ||
        nftUnit222.length <=
            multisig_types_1.POLICY_ID_HEX_LENGTH + config_service_1.CIP68_PREFIX.USER_222.length) {
        return [];
    }
    const policyId = nftUnit222.slice(0, multisig_types_1.POLICY_ID_HEX_LENGTH);
    const rest = nftUnit222.slice(multisig_types_1.POLICY_ID_HEX_LENGTH);
    if (!rest.startsWith(config_service_1.CIP68_PREFIX.USER_222)) {
        return [];
    }
    const assetNameHex = rest.slice(config_service_1.CIP68_PREFIX.USER_222.length);
    const unit100 = policyId + config_service_1.CIP68_PREFIX.REFERENCE_100 + assetNameHex;
    const txList = await standalone_1.blockfrostFetcher.fetchAssetTransactions(unit100);
    if (!Array.isArray(txList) || txList.length === 0) {
        return [];
    }
    let outputWithUnit;
    for (const tx of [...txList].reverse()) {
        const txHash = tx.tx_hash;
        const txUtxos = await standalone_1.blockfrostFetcher.fetchTransactionsUTxO(txHash);
        const outputs = (_a = txUtxos.outputs) !== null && _a !== void 0 ? _a : [];
        outputWithUnit = outputs.find((output) => { var _a; return (_a = output.amount) === null || _a === void 0 ? void 0 : _a.some((a) => a.unit === unit100); });
        if (outputWithUnit && outputWithUnit.inline_datum) {
            break;
        }
    }
    if (!outputWithUnit || !outputWithUnit.inline_datum) {
        return [];
    }
    const datum = String(outputWithUnit.inline_datum);
    const meta = (await (0, utils_1.datumToJson)(datum, {
        contain_pk: true,
    }));
    const minterPk = (_c = (_b = meta._pk) !== null && _b !== void 0 ? _b : (await (0, utils_1.getPkHash)(datum))) !== null && _c !== void 0 ? _c : "";
    const receivers = (0, utils_1.decodeReceivers)(meta.receivers);
    const allowed = new Set();
    if (minterPk) {
        allowed.add(minterPk.toLowerCase());
    }
    for (const receiver of receivers) {
        const raw = ((_d = receiver.pubKeyHash) !== null && _d !== void 0 ? _d : "").trim();
        if (!raw) {
            continue;
        }
        let pkh = raw;
        if (raw.startsWith("addr")) {
            try {
                pkh = (0, core_1.resolvePaymentKeyHash)(raw);
            }
            catch (_e) {
                pkh = raw;
            }
        }
        if (pkh) {
            allowed.add(pkh.toLowerCase());
        }
    }
    return Array.from(allowed);
}
async function assertRecipientAllowedByRef100(recipientPkh, nftUnit222) {
    var _a, _b;
    const allowed = await getAllowedPkhsFromRef100ByNftUnit(nftUnit222);
    const recipientLower = recipientPkh.toLowerCase();
    if (allowed.length === 0) {
        throw new Error("Ref100 metadata for this NFT was not found — cannot verify traceability chain.");
    }
    if (!allowed.includes(recipientLower)) {
        const defaultEAddress = (_b = (_a = process.env.E_ADDRESS) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : "";
        let defaultEPkh = null;
        if (defaultEAddress && defaultEAddress.startsWith("addr")) {
            try {
                defaultEPkh = (0, core_1.resolvePaymentKeyHash)(defaultEAddress);
            }
            catch (_c) {
                defaultEPkh = null;
            }
        }
        throw new Error(`Recipient is not in the traceability chain (Ref100.receivers/_pk). ` +
            `recipientLower=${recipientLower}, allowedSample=${allowed
                .slice(0, 5)
                .join(",")}`);
    }
}
//# sourceMappingURL=multisig.traceability.js.map