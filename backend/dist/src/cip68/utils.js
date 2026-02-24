"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRef100Unit = buildRef100Unit;
exports.datumToJson = datumToJson;
exports.getPkHash = getPkHash;
exports.decodeReceivers = decodeReceivers;
exports.ensureReceiversRaw = ensureReceiversRaw;
exports.metadataForDatum = metadataForDatum;
exports.parseHttpErrorCip68 = parseHttpErrorCip68;
const cbor_1 = require("cbor");
const axios_1 = require("axios");
const config_service_1 = require("../config/config.service");
function buildRef100Unit(policyId, assetName) {
    const hexName = Buffer.from(assetName, "utf8").toString("hex");
    return `${policyId}${config_service_1.CIP68_PREFIX.REFERENCE_100}${hexName}`;
}
function datumValueToStr(value, asHex = false) {
    if (value == null)
        return "";
    const isBytes = Buffer.isBuffer(value) || value instanceof Uint8Array;
    if (isBytes && asHex) {
        return Buffer.from(value).toString("hex");
    }
    if (isBytes) {
        try {
            return Buffer.from(value).toString("utf-8");
        }
        catch (_a) {
            return Buffer.from(value).toString("hex");
        }
    }
    return String(value);
}
async function datumToJson(datum, option) {
    var _a;
    const buffer = Buffer.from(datum, "hex");
    const decoded = await (0, cbor_1.decodeFirst)(buffer);
    const decodedValue = (_a = decoded === null || decoded === void 0 ? void 0 : decoded.value) !== null && _a !== void 0 ? _a : decoded;
    const datumMap = Array.isArray(decodedValue) ? decodedValue[0] : decodedValue;
    if (!(datumMap instanceof Map)) {
        throw new Error("Invalid Datum");
    }
    const result = {};
    datumMap.forEach((value, key) => {
        const keyStr = typeof key === "string" ? key : datumValueToStr(key);
        if (keyStr === "_pk" && !(option === null || option === void 0 ? void 0 : option.contain_pk)) {
            return;
        }
        const outputAsHex = keyStr === "_pk" || keyStr === "receivers_raw";
        try {
            result[keyStr] = datumValueToStr(value, outputAsHex);
        }
        catch (_a) {
            result[keyStr] = String(value);
        }
    });
    return result;
}
async function getPkHash(datum) {
    const buffer = Buffer.from(datum, "hex");
    const decoded = await (0, cbor_1.decodeFirst)(buffer);
    const keyValuePairs = decoded.value[0];
    for (const [key, value] of keyValuePairs) {
        const keyStr = key.toString("utf-8");
        if (keyStr === "_pk") {
            return value.toString("hex");
        }
    }
    return null;
}
function decodeReceivers(receiversStr) {
    if (!receiversStr || typeof receiversStr !== "string") {
        return [];
    }
    const parts = receiversStr.split(",");
    return parts
        .map((part) => {
        const trimmed = part.trim();
        if (!trimmed)
            return null;
        const colonIndex = trimmed.indexOf(":");
        const pubKeyHash = colonIndex > 0 ? trimmed.slice(0, colonIndex).trim() : trimmed;
        return pubKeyHash ? { pubKeyHash } : null;
    })
        .filter((item) => item != null);
}
function ensureReceiversRaw(metadata) {
    const receivers = metadata.receivers;
    if (!receivers || typeof receivers !== "string") {
        return metadata;
    }
    const pubKeyHashList = decodeReceivers(receivers);
    const concatenatedPks = pubKeyHashList.map((item) => item.pubKeyHash).join("");
    return Object.assign(Object.assign({}, metadata), { receivers_raw: concatenatedPks });
}
function metadataForDatum(metadata) {
    const metaWithRaw = ensureReceiversRaw(metadata);
    if (!metaWithRaw.receivers_raw) {
        return metaWithRaw;
    }
    const receiversRawAsUtf8Hex = Buffer.from(metaWithRaw.receivers_raw, "utf8").toString("hex");
    return Object.assign(Object.assign({}, metaWithRaw), { receivers_raw: receiversRawAsUtf8Hex });
}
function parseHttpErrorCip68(error) {
    if (!axios_1.default.isAxiosError(error)) {
        return JSON.stringify(error);
    }
    if (error.response) {
        return JSON.stringify({
            data: error.response.data,
            headers: error.response.headers,
            status: error.response.status,
        });
    }
    if (error.request) {
        return JSON.stringify(error.request);
    }
    return JSON.stringify({
        code: error.code,
        message: error.message,
    });
}
//# sourceMappingURL=utils.js.map