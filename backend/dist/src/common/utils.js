"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRef100Unit = buildRef100Unit;
exports.parseHttpError = parseHttpError;
const axios_1 = require("axios");
function buildRef100Unit(policyId, assetName, prefix) {
    const hexName = Buffer.from(assetName, "utf8").toString("hex");
    return `${policyId}${prefix.REFERENCE_100}${hexName}`;
}
function parseHttpError(error) {
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