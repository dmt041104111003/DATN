"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockfrostProvider = exports.blockfrostFetcher = void 0;
exports.getBlockfrostFetcher = getBlockfrostFetcher;
exports.getBlockfrostProvider = getBlockfrostProvider;
const core_1 = require("@meshsdk/core");
const config_service_1 = require("../config/config.service");
const utils_1 = require("../../shared/common/utils");
const blockfrost_fetcher_1 = require("./blockfrost.fetcher");
let _config = null;
let _fetcher = null;
let _provider = null;
function getConfig() {
    if (!_config)
        _config = new config_service_1.ConfigService();
    return _config;
}
function getBlockfrostFetcher() {
    if (!_fetcher) {
        const config = getConfig();
        _fetcher = new blockfrost_fetcher_1.BlockfrostFetcher(config.blockfrostApiKey, 0, {
            buildRef100Unit: (p, a) => (0, utils_1.buildRef100Unit)(p, a, config.cip68Prefix),
            parseHttpError: utils_1.parseHttpError,
        });
    }
    return _fetcher;
}
function getBlockfrostProvider() {
    if (!_provider) {
        _provider = new core_1.BlockfrostProvider(getConfig().blockfrostApiKey);
    }
    return _provider;
}
exports.blockfrostFetcher = getBlockfrostFetcher();
exports.blockfrostProvider = getBlockfrostProvider();
//# sourceMappingURL=standalone.js.map