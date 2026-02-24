"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = exports.CIP68_PREFIX = exports.VALIDATOR_TITLE = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
exports.VALIDATOR_TITLE = {
    mint: "mint.mint.mint",
    store: "store.store.spend",
};
exports.CIP68_PREFIX = {
    REFERENCE_100: "000643b0",
    USER_222: "000de140",
};
let ConfigService = class ConfigService {
    constructor() {
        this._plutus = null;
    }
    get blockfrostApiKey() {
        var _a;
        return (_a = process.env.BLOCKFROST_API_KEY) !== null && _a !== void 0 ? _a : "";
    }
    get koiosToken() {
        var _a;
        return (_a = process.env.KOIOS_TOKEN) !== null && _a !== void 0 ? _a : "";
    }
    get appNetwork() {
        var _a;
        const raw = ((_a = process.env.NEXT_PUBLIC_APP_NETWORK) !== null && _a !== void 0 ? _a : "preprod").toLowerCase();
        return raw === "mainnet" ? "mainnet" : "preprod";
    }
    get appNetworkId() {
        return this.appNetwork === "mainnet" ? 1 : 0;
    }
    get ipfsEndpoint() {
        var _a;
        return (_a = process.env.IPFS_ENDPOINT) !== null && _a !== void 0 ? _a : "";
    }
    get ipfsGateway() {
        var _a;
        return (_a = process.env.NEXT_PUBLIC_IPFS_GATEWAY) !== null && _a !== void 0 ? _a : "https://ipfs.io/";
    }
    get mintReferenceScriptHash() {
        var _a;
        return (_a = process.env.MINT_REFERENCE_SCRIPT_HASH) !== null && _a !== void 0 ? _a : "";
    }
    get storeReferenceScriptHash() {
        var _a;
        return (_a = process.env.STORE_REFERENCE_SCRIPT_HASH) !== null && _a !== void 0 ? _a : "";
    }
    get validatorTitle() {
        return exports.VALIDATOR_TITLE;
    }
    get cip68Prefix() {
        return exports.CIP68_PREFIX;
    }
    get jwtSecret() {
        var _a;
        return (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "";
    }
    get cloudinaryCloudName() {
        var _a;
        return (_a = process.env.CLOUDINARY_CLOUD_NAME) !== null && _a !== void 0 ? _a : "";
    }
    get cloudinaryApiKey() {
        var _a;
        return (_a = process.env.CLOUDINARY_API_KEY) !== null && _a !== void 0 ? _a : "";
    }
    get cloudinaryApiSecret() {
        var _a;
        return (_a = process.env.CLOUDINARY_API_SECRET) !== null && _a !== void 0 ? _a : "";
    }
    getPlutus() {
        if (!this._plutus) {
            const path = (0, path_1.join)(process.cwd(), "plutus.json");
            const content = (0, fs_1.readFileSync)(path, "utf-8");
            this._plutus = JSON.parse(content);
        }
        return this._plutus;
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)()
], ConfigService);
//# sourceMappingURL=config.service.js.map