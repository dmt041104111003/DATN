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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@meshsdk/core");
const client_1 = require("@prisma/client");
const standalone_1 = require("../cardano/standalone");
const config_service_1 = require("../config/config.service");
const order_contract_1 = require("./order.contract");
const prisma_service_1 = require("../prisma/prisma.service");
const product_service_1 = require("../product/product.service");
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
    constructor(prisma, product) {
        this.prisma = prisma;
        this.product = product;
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
        var _a;
        const profile = await this.prisma.profile.findUnique({
            where: { id: profileId },
            select: { walletAddress: true },
        });
        if (!((_a = profile === null || profile === void 0 ? void 0 : profile.walletAddress) === null || _a === void 0 ? void 0 : _a.trim())) {
            return [];
        }
        const wallet = profile.walletAddress.trim().toLowerCase();
        const rows = await this.prisma.deliveryOrder.findMany({
            where: {
                status: { in: [client_1.DeliveryStatus.IN_TRANSIT, client_1.DeliveryStatus.DELIVERED] },
                NOT: { senderAddress: profile.walletAddress.trim() },
            },
            orderBy: { createdAt: "desc" },
        });
        return rows
            .filter((row) => {
            const owners = Array.isArray(row.ownerAddresses) ? row.ownerAddresses : [];
            return owners.some((addr) => (addr || "").trim().toLowerCase() === wallet);
        })
            .map((row) => {
            var _a, _b, _c, _d;
            const r = row;
            return {
                id: r.id,
                lockTxHash: r.lockTxHash,
                scriptOutputIndex: r.scriptOutputIndex,
                batchId: r.batchId,
                policyId: r.policyId,
                recipientAddress: r.recipientAddress,
                senderAddress: r.senderAddress,
                ownerAddresses: Array.isArray(r.ownerAddresses) ? r.ownerAddresses : [],
                status: r.status,
                partialSignedTxHex: (_a = r.partialSignedTxHex) !== null && _a !== void 0 ? _a : null,
                partialSignedByAddress: (_b = r.partialSignedByAddress) !== null && _b !== void 0 ? _b : null,
                secondSignedByAddress: (_c = r.secondSignedByAddress) !== null && _c !== void 0 ? _c : null,
                unlockTxHash: (_d = r.unlockTxHash) !== null && _d !== void 0 ? _d : null,
            };
        });
    }
    async savePartialSignedTx(deliveryId, profileId, partialTxHex) {
        var _a;
        const hex = (partialTxHex || "").trim().replace(/^0x/, "");
        if (hex.length < 100) {
            throw new common_1.BadRequestException("partialTxHex is too short.");
        }
        const profile = await this.prisma.profile.findUnique({
            where: { id: profileId },
            select: { walletAddress: true },
        });
        if (!((_a = profile === null || profile === void 0 ? void 0 : profile.walletAddress) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw new common_1.BadRequestException("Profile or wallet not found.");
        }
        const wallet = profile.walletAddress.trim().toLowerCase();
        const delivery = await this.prisma.deliveryOrder.findUnique({
            where: { id: deliveryId },
        });
        if (!delivery || delivery.status !== client_1.DeliveryStatus.IN_TRANSIT) {
            throw new common_1.BadRequestException("Order not found or not in delivery.");
        }
        const owners = Array.isArray(delivery.ownerAddresses) ? delivery.ownerAddresses : [];
        const isOwner = owners.some((addr) => (addr || "").trim().toLowerCase() === wallet);
        if (!isOwner) {
            throw new common_1.BadRequestException("You are not an owner of this order.");
        }
        await this.prisma.$executeRaw(client_1.Prisma.sql `UPDATE "DeliveryOrder" SET "partialSignedTxHex" = ${hex}, "partialSignedByAddress" = ${profile.walletAddress.trim()} WHERE id = ${deliveryId}`);
        return { ok: true };
    }
    async recordOrder(params) {
        var _a, _b, _c;
        const scriptOutputIndex = (_a = params.scriptOutputIndex) !== null && _a !== void 0 ? _a : 0;
        const ownerAddresses = Array.isArray(params.ownerAddresses) ? params.ownerAddresses : [];
        const delivery = await this.prisma.deliveryOrder.upsert({
            where: {
                lockTxHash_scriptOutputIndex: {
                    lockTxHash: params.lockTxHash.trim(),
                    scriptOutputIndex,
                },
            },
            create: {
                lockTxHash: params.lockTxHash.trim(),
                scriptOutputIndex,
                batchId: params.batchId.trim(),
                policyId: (_c = (_b = params.policyId) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : null,
                recipientAddress: params.recipientAddress.trim(),
                senderAddress: params.senderAddress.trim(),
                ownerAddresses,
                status: client_1.DeliveryStatus.IN_TRANSIT,
            },
            update: {},
        });
        return { id: delivery.id };
    }
    async confirmOrderComplete(params) {
        var _a, _b;
        const { unlockTxHash, witnessCount, signedByAddress, deliveryId } = params;
        if (witnessCount < 2) {
            throw new common_1.BadRequestException("Order completion requires at least 2 signatures (witnessCount >= 2).");
        }
        let delivery = null;
        if (deliveryId != null && Number.isInteger(deliveryId) && deliveryId > 0) {
            const found = await this.prisma.deliveryOrder.findUnique({
                where: { id: deliveryId },
            });
            if (found && found.status === client_1.DeliveryStatus.IN_TRANSIT) {
                delivery = { id: found.id, batchId: found.batchId, recipientAddress: found.recipientAddress, status: found.status };
            }
        }
        if (!delivery) {
            const tx = await standalone_1.blockfrostFetcher.fetchTransactionsUTxO(unlockTxHash.trim());
            const inputs = (_a = tx === null || tx === void 0 ? void 0 : tx.inputs) !== null && _a !== void 0 ? _a : [];
            for (const inp of inputs) {
                const lockTxHash = inp.tx_hash;
                const scriptOutputIndex = (_b = inp.output_index) !== null && _b !== void 0 ? _b : 0;
                const found = await this.prisma.deliveryOrder.findUnique({
                    where: {
                        lockTxHash_scriptOutputIndex: { lockTxHash, scriptOutputIndex },
                    },
                });
                if (found && found.status === client_1.DeliveryStatus.IN_TRANSIT) {
                    delivery = { id: found.id, batchId: found.batchId, recipientAddress: found.recipientAddress, status: found.status };
                    break;
                }
            }
        }
        if (!delivery) {
            throw new common_1.BadRequestException("No matching order (IN_TRANSIT) found for this completion tx. Ensure order was confirmed first, or pass deliveryId.");
        }
        const secondAddr = (signedByAddress || "").trim() || null;
        await this.prisma.$executeRaw(client_1.Prisma.sql `UPDATE "DeliveryOrder" SET status = 'DELIVERED', "unlockTxHash" = ${unlockTxHash.trim()}, "secondSignedByAddress" = ${secondAddr} WHERE id = ${delivery.id}`);
        const profile = await this.prisma.profile.findFirst({
            where: {
                walletAddress: delivery.recipientAddress.trim(),
                role: { code: { in: ["TRANSIT", "AGENT"] } },
            },
            select: { id: true },
        });
        if (profile) {
            await this.product.addToWarehouse(profile.id, delivery.batchId);
        }
        return { ok: true, recipientAddress: delivery.recipientAddress };
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        product_service_1.ProductService])
], OrderService);
//# sourceMappingURL=order.service.js.map