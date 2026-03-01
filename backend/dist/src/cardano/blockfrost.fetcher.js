"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockfrostFetcher = void 0;
const axios_1 = require("axios");
const core_1 = require("@meshsdk/core");
const utils_1 = require("../common/utils");
const config_service_1 = require("../config/config.service");
class BlockfrostFetcher {
    constructor(projectIdOrBaseUrl, version, deps) {
        const { buildRef100Unit: br, parseHttpError: pe } = deps !== null && deps !== void 0 ? deps : {
            buildRef100Unit: (p, a) => (0, utils_1.buildRef100Unit)(p, a, config_service_1.CIP68_PREFIX),
            parseHttpError: utils_1.parseHttpError,
        };
        this._buildRef100Unit = br;
        this._parseHttpError = pe;
        if (typeof projectIdOrBaseUrl === "string" &&
            (projectIdOrBaseUrl.startsWith("http") || projectIdOrBaseUrl.startsWith("/"))) {
            this._axiosInstance = axios_1.default.create({ baseURL: projectIdOrBaseUrl });
            this._network = "mainnet";
        }
        else {
            const projectId = projectIdOrBaseUrl;
            const network = projectId.slice(0, 7);
            this._axiosInstance = axios_1.default.create({
                baseURL: `https://cardano-${network}.blockfrost.io/api/v${version !== null && version !== void 0 ? version : 0}`,
                headers: { project_id: projectId },
            });
            this._network = network;
        }
    }
    async _get(path, params) {
        try {
            const config = params ? { params } : undefined;
            const { data, status } = await this._axiosInstance.get(path, config);
            if (status === 200 || status === 202)
                return data;
            throw this._parseHttpError(data);
        }
        catch (error) {
            throw this._parseHttpError(error);
        }
    }
    async _postBinary(path, body) {
        var _a;
        try {
            const { data, status } = await this._axiosInstance.post(path, body, {
                headers: { "Content-Type": "application/cbor" },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                transformRequest: [(d) => d],
            });
            if (status !== 200 && status !== 202)
                throw this._parseHttpError(data);
            if (typeof data === "string" && /^[a-fA-F0-9]{64}$/.test(data))
                return data;
            if (data && typeof data === "object") {
                const v = (_a = data.tx_id) !== null && _a !== void 0 ? _a : data.transaction_id;
                if (typeof v === "string" && /^[a-fA-F0-9]{64}$/.test(v))
                    return v;
            }
            throw this._parseHttpError(data);
        }
        catch (error) {
            throw this._parseHttpError(error);
        }
    }
    async submitTx(cborBuffer) {
        return this._postBinary("/tx/submit", cborBuffer);
    }
    async fetchAddressDetail(address) {
        return this._get(`/addresses/${address}/total`);
    }
    async fetchSpecificAsset(asset) {
        return this._get(`/assets/${asset}`);
    }
    async isAssetRevoked(policyId, assetName) {
        const ref100Unit = this._buildRef100Unit(policyId, assetName);
        try {
            const assetInfo = (await this.fetchSpecificAsset(ref100Unit));
            return (assetInfo === null || assetInfo === void 0 ? void 0 : assetInfo.quantity) === "0";
        }
        catch (_a) {
            return false;
        }
    }
    async fetchAssetTransactions(asset) {
        return this._get(`/assets/${asset}/transactions?order=desc`);
    }
    async fetchAllAssetTransactions(asset) {
        const allTxHashes = [];
        const pageSize = 100;
        let currentPage = 1;
        for (;;) {
            const pageData = await this._get(`/assets/${asset}/transactions`, { page: currentPage, count: pageSize, order: "asc" });
            if (!Array.isArray(pageData) || pageData.length === 0)
                break;
            allTxHashes.push(...pageData);
            if (pageData.length < pageSize)
                break;
            currentPage += 1;
        }
        return allTxHashes;
    }
    async fetchAssetsByPolicy(policyId) {
        const allAssets = [];
        const pageSize = 100;
        let currentPage = 1;
        for (;;) {
            const pageData = await this._get(`/assets/policy/${policyId}`, { page: currentPage, count: pageSize, order: "asc" });
            if (!Array.isArray(pageData) || pageData.length === 0)
                break;
            allAssets.push(...pageData);
            if (pageData.length < pageSize)
                break;
            currentPage += 1;
        }
        return allAssets;
    }
    async fetchAssetsByAddress(address) {
        const rewardAddress = address.startsWith("addr")
            ? (0, core_1.resolveRewardAddress)(address)
            : address;
        return this._get(`/accounts/${rewardAddress}/addresses/assets`);
    }
    async fetchUtxoByAddress(address) {
        var _a;
        const allUtxos = [];
        const pageSize = 100;
        let currentPage = 1;
        try {
            for (;;) {
                const pageData = await this._get(`/addresses/${address}/utxos`, { page: currentPage, count: pageSize });
                if (!Array.isArray(pageData) || pageData.length === 0)
                    break;
                allUtxos.push(...pageData);
                if (pageData.length < pageSize)
                    break;
                currentPage += 1;
            }
            return allUtxos;
        }
        catch (err) {
            if (axios_1.default.isAxiosError(err) && ((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                const baseUrl = this._axiosInstance.defaults.baseURL || "";
                console.error("[Blockfrost 404] GET /addresses/{address}/utxos — address:", address.slice(0, 40) + "...", "| baseURL:", baseUrl);
            }
            throw this._parseHttpError(err);
        }
    }
    async fetchTransactionsUTxO(txHash) {
        return this._get(`/txs/${txHash}/utxos`);
    }
    async fetchDatum(datum) {
        return this._get(`/scripts/datum/${datum}`);
    }
    async fetchSpecialTransaction(txHash) {
        return this._get(`/txs/${txHash}`);
    }
    async fetchAddressUTXOsAsset(address, asset) {
        return this._get(`/addresses/${address}/utxos/${asset}`);
    }
    async fetchSpecialAddress(address) {
        return this._get(`/addresses/${address}`);
    }
    async fetchAccountAssociate(stakeAddress) {
        return this._get(`/accounts/${stakeAddress}/addresses`);
    }
    async fetchDetailsAccount(stakeAddress) {
        return this._get(`/accounts/${stakeAddress}/addresses/total`);
    }
}
exports.BlockfrostFetcher = BlockfrostFetcher;
//# sourceMappingURL=blockfrost.fetcher.js.map