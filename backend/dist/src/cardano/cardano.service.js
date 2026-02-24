"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardanoService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@meshsdk/core");
const config_service_1 = require("../config/config.service");
const utils_1 = require("../common/utils");
const blockfrost_fetcher_1 = require("./blockfrost.fetcher");
let CardanoService = class CardanoService {
    constructor(config) {
        this.config = config;
        this._fetcher = null;
        this._provider = null;
    }
    get blockfrostFetcher() {
        if (!this._fetcher) {
            this._fetcher = new blockfrost_fetcher_1.BlockfrostFetcher(this.config.blockfrostApiKey, 0, {
                buildRef100Unit: (p, a) => (0, utils_1.buildRef100Unit)(p, a, this.config.cip68Prefix),
                parseHttpError: utils_1.parseHttpError,
            });
        }
        return this._fetcher;
    }
    get blockfrostProvider() {
        if (!this._provider) {
            this._provider = new core_1.BlockfrostProvider(this.config.blockfrostApiKey);
        }
        return this._provider;
    }
};
exports.CardanoService = CardanoService;
exports.CardanoService = CardanoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], CardanoService);
//# sourceMappingURL=cardano.service.js.map