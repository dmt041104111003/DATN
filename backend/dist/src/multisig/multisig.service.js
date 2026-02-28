"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultisigService = void 0;
const common_1 = require("@nestjs/common");
const multisig_contract_1 = require("./multisig.contract");
let MultisigService = class MultisigService {
    constructor() {
        this._contract = null;
    }
    getContract() {
        if (!this._contract)
            this._contract = new multisig_contract_1.MultisigContract();
        return this._contract;
    }
    getScriptAddress() {
        return this.getContract().getScriptAddress();
    }
    getScriptCbor() {
        return this.getContract().getScriptCbor();
    }
};
exports.MultisigService = MultisigService;
exports.MultisigService = MultisigService = __decorate([
    (0, common_1.Injectable)()
], MultisigService);
//# sourceMappingURL=multisig.service.js.map