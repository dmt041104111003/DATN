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
exports.Cip68UtilsService = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("./utils");
const config_service_1 = require("../config/config.service");
let Cip68UtilsService = class Cip68UtilsService {
    constructor(config) {
        this.config = config;
    }
    buildRef100Unit(policyId, assetName) {
        return (0, utils_1.buildRef100Unit)(policyId, assetName);
    }
    async datumToJson(datum, option) {
        return (0, utils_1.datumToJson)(datum, option);
    }
    async getPkHash(datum) {
        return (0, utils_1.getPkHash)(datum);
    }
    decodeReceivers(receiversStr) {
        return (0, utils_1.decodeReceivers)(receiversStr);
    }
    ensureReceiversRaw(metadata) {
        return (0, utils_1.ensureReceiversRaw)(metadata);
    }
    metadataForDatum(metadata) {
        return (0, utils_1.metadataForDatum)(metadata);
    }
};
exports.Cip68UtilsService = Cip68UtilsService;
exports.Cip68UtilsService = Cip68UtilsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], Cip68UtilsService);
//# sourceMappingURL=cip68-utils.service.js.map