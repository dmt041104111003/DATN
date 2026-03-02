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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@meshsdk/core");
const standalone_1 = require("../core/cardano/standalone");
const config_service_1 = require("../core/config/config.service");
const order_contract_1 = require("./order.contract");
const product_service_1 = require("../product/product.service");
const order_repository_1 = require("./domain/order.repository");
const list_orders_for_profile_use_case_1 = require("./application/use-cases/list-orders-for-profile.use-case");
const save_partial_signed_tx_use_case_1 = require("./application/use-cases/save-partial-signed-tx.use-case");
const record_order_use_case_1 = require("./application/use-cases/record-order.use-case");
const confirm_order_complete_use_case_1 = require("./application/use-cases/confirm-order-complete.use-case");
const LABEL_222 = config_service_1.CIP68_PREFIX.USER_222;
function assetNameToHex(assetName) {
    if (!(assetName === null || assetName === void 0 ? void 0 : assetName.trim()))
        return "";
    const s = assetName.trim();
    if (s.toLowerCase().startsWith("hex:") && s.length > 4)
        return s.slice(4);
    return Buffer.from(s, "utf8").toString("hex");
}
let OrderService = class OrderService {
    constructor(orderRepository, product, listOrdersForProfileUseCase, savePartialSignedTxUseCase, recordOrderUseCase, confirmOrderCompleteUseCase) {
        this.orderRepository = orderRepository;
        this.product = product;
        this.listOrdersForProfileUseCase = listOrdersForProfileUseCase;
        this.savePartialSignedTxUseCase = savePartialSignedTxUseCase;
        this.recordOrderUseCase = recordOrderUseCase;
        this.confirmOrderCompleteUseCase = confirmOrderCompleteUseCase;
        this._contract = null;
    }
    getContract() {
        if (!this._contract)
            this._contract = new order_contract_1.OrderContract();
        return this._contract;
    }
    getScriptAddress() {
        return this.getContract().getScriptAddress();
    }
    getScriptCbor() {
        return this.getContract().getScriptCbor();
    }
    async buildLockTx(params) {
        const utxos = params.utxos;
        return this.getContract().buildLockTx(Object.assign(Object.assign({}, params), { utxos }));
    }
    async buildUnlockTx(params) {
        return this.getContract().buildUnlockTx({
            scriptUtxo: params.scriptUtxo,
            outputAddress: params.outputAddress,
            signingOwnersPkh: params.signingOwnersPkh,
            threshold: params.threshold,
            collateral: params.collateral,
            changeAddress: params.changeAddress,
            utxos: params.utxos,
        });
    }
    async parseDatumFromUtxo(utxo) {
        const datum = await this.getContract().parseDatumFromUtxo(utxo);
        const recipientAddress = this.getContract().getAddressFromPkh(datum.recipientPkh);
        const ownerAddresses = datum.ownersPkh.map((pkh) => this.getContract().getAddressFromPkh(pkh)).filter(Boolean);
        return Object.assign(Object.assign({}, datum), { recipientAddress, ownerAddresses });
    }
    async getScriptUtxos(scriptAddress) {
        var _a, _b;
        const addr = scriptAddress !== null && scriptAddress !== void 0 ? scriptAddress : this.getScriptAddress();
        const utxos = await standalone_1.blockfrostProvider.fetchAddressUTxOs(addr);
        const blockByTx = new Map();
        for (const u of utxos) {
            const txHash = (_a = u.input) === null || _a === void 0 ? void 0 : _a.txHash;
            if (txHash && !blockByTx.has(txHash)) {
                try {
                    const tx = await standalone_1.blockfrostFetcher.fetchSpecialTransaction(txHash);
                    blockByTx.set(txHash, (_b = tx === null || tx === void 0 ? void 0 : tx.block_height) !== null && _b !== void 0 ? _b : 0);
                }
                catch (_c) {
                    blockByTx.set(txHash, 0);
                }
            }
        }
        return [...utxos].sort((a, b) => {
            var _a, _b, _c, _d, _e, _f;
            const blockA = (_c = blockByTx.get((_b = (_a = a.input) === null || _a === void 0 ? void 0 : _a.txHash) !== null && _b !== void 0 ? _b : "")) !== null && _c !== void 0 ? _c : 0;
            const blockB = (_f = blockByTx.get((_e = (_d = b.input) === null || _d === void 0 ? void 0 : _d.txHash) !== null && _e !== void 0 ? _e : "")) !== null && _f !== void 0 ? _f : 0;
            return blockB - blockA;
        });
    }
    async getScriptUtxoByAsset(policyId, assetName, scriptAddress) {
        var _a;
        const pid = policyId === null || policyId === void 0 ? void 0 : policyId.trim();
        const name = assetName === null || assetName === void 0 ? void 0 : assetName.trim();
        if (!pid || !name)
            return null;
        const hexName = assetNameToHex(name);
        const targetUnit = pid + LABEL_222 + hexName;
        const utxos = await this.getScriptUtxos(scriptAddress);
        return (_a = utxos.find((u) => {
            var _a;
            return Array.isArray((_a = u.output) === null || _a === void 0 ? void 0 : _a.amount) &&
                u.output.amount.some((a) => a.unit === targetUnit);
        })) !== null && _a !== void 0 ? _a : null;
    }
    mergePartialTx(partialTxHex, secondSignerResultHex) {
        const partial = partialTxHex.trim().replace(/^0x/, "");
        const second = secondSignerResultHex.trim().replace(/^0x/, "");
        if (partial.length < 100) {
            throw new Error("partialTxHex is too short.");
        }
        let secondVkeysArray = [];
        try {
            const txSecond = core_1.cst.deserializeTx(second);
            const vkeys = txSecond.witnessSet().vkeys();
            secondVkeysArray = vkeys ? Array.from(vkeys.values()) : [];
        }
        catch (_a) {
            throw new Error("Could not parse result from owner 2 wallet (need full signed tx hex from wallet).");
        }
        if (secondVkeysArray.length === 0) {
            throw new Error("Owner 2 wallet did not return signatures. Ensure you are signed in with the second owner wallet (different from the wallet that signed step 1).");
        }
        const txPartial = core_1.cst.deserializeTx(partial);
        const partialVkeys = txPartial.witnessSet().vkeys();
        const partialVkeysArray = partialVkeys ? Array.from(partialVkeys.values()) : [];
        const normalizeVkeyId = (raw) => {
            const h = raw.toLowerCase().replace(/^0x/, "").replace(/^5820/, "");
            if (h.length === 64)
                return h;
            if (h.length === 56)
                return h;
            return raw;
        };
        const partialKeyIds = new Set(partialVkeysArray.map((vkw) => {
            const core = vkw.toCore();
            const id = Array.isArray(core) ? String(core[0]) : JSON.stringify(core);
            return normalizeVkeyId(id);
        }));
        const newVkeysOnly = secondVkeysArray.filter((vkw) => {
            const core = vkw.toCore();
            const id = Array.isArray(core) ? String(core[0]) : JSON.stringify(core);
            return !partialKeyIds.has(normalizeVkeyId(id));
        });
        if (newVkeysOnly.length === 0 && partialVkeysArray.length < 2) {
            throw new Error("No new signatures from owner 2 wallet. You must sign in with the second owner wallet (different from the signer of step 1).");
        }
        let mergedHex;
        if (newVkeysOnly.length === 0) {
            mergedHex = partial;
        }
        else {
            mergedHex = core_1.EmbeddedWallet.addWitnessSets(partial, newVkeysOnly);
        }
        const txMerged = core_1.cst.deserializeTx(mergedHex);
        const mergedVkeys = txMerged.witnessSet().vkeys();
        const mergedVkeysArray = mergedVkeys ? Array.from(mergedVkeys.values()) : [];
        const witnessCount = mergedVkeysArray.length;
        const distinctKeyIds = new Set(mergedVkeysArray.map((vkw) => {
            const core = vkw.toCore();
            const id = Array.isArray(core) ? String(core[0]) : JSON.stringify(core);
            return normalizeVkeyId(id);
        }));
        const distinctSignerCount = distinctKeyIds.size;
        if (witnessCount < 2) {
            throw new Error(`After merge the transaction has only ${witnessCount} signature(s); at least 2 required for 2-of-2.`);
        }
        if (distinctSignerCount < 2) {
            throw new Error("Transaction has 2 witnesses but from only 1 wallet. Use a different wallet for step 2.");
        }
        const { requiredSigners } = this.inspectTx(mergedHex);
        return { mergedTxHex: mergedHex, witnessCount, requiredSigners };
    }
    inspectTx(txHex) {
        const hex = txHex.trim().replace(/^0x/, "");
        if (hex.length < 100) {
            throw new Error("txHex is too short.");
        }
        let tx;
        try {
            tx = core_1.cst.deserializeTx(hex);
        }
        catch (_a) {
            throw new Error("Could not parse tx hex.");
        }
        const body = tx.body();
        const req = body.requiredSigners();
        const requiredSigners = req
            ? req.values().map((h) => h.toCore())
            : [];
        const vkeys = tx.witnessSet().vkeys();
        const witnessCount = vkeys ? vkeys.size() : 0;
        return { requiredSigners, witnessCount };
    }
    async listOrdersForProfile(profileId) {
        return this.listOrdersForProfileUseCase.execute(profileId);
    }
    async savePartialSignedTx(deliveryId, profileId, partialTxHex) {
        return this.savePartialSignedTxUseCase.execute(deliveryId, profileId, partialTxHex);
    }
    async recordOrder(params) {
        const recordParams = {
            lockTxHash: params.lockTxHash,
            scriptOutputIndex: params.scriptOutputIndex,
            batchId: params.batchId,
            policyId: params.policyId,
            recipientAddress: params.recipientAddress,
            senderAddress: params.senderAddress,
            ownerAddresses: params.ownerAddresses,
        };
        return this.recordOrderUseCase.execute(recordParams);
    }
    async confirmOrderComplete(params) {
        return this.confirmOrderCompleteUseCase.execute(params);
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(order_repository_1.ORDER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, product_service_1.ProductService,
        list_orders_for_profile_use_case_1.ListOrdersForProfileUseCase,
        save_partial_signed_tx_use_case_1.SavePartialSignedTxUseCase,
        record_order_use_case_1.RecordOrderUseCase,
        confirm_order_complete_use_case_1.ConfirmOrderCompleteUseCase])
], OrderService);
//# sourceMappingURL=order.service.js.map