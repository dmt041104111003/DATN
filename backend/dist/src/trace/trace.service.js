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
exports.TraceService = void 0;
const core_1 = require("@meshsdk/core");
const common_1 = require("@nestjs/common");
const cardano_service_1 = require("../cardano/cardano.service");
const prisma_service_1 = require("../prisma/prisma.service");
const cip68_contract_1 = require("../cip68/cip68.contract");
const trace_helpers_1 = require("./trace.helpers");
let TraceService = class TraceService {
    constructor(cardano, prisma) {
        this.cardano = cardano;
        this.prisma = prisma;
    }
    createContract(changeAddress, opts) {
        const wallet = (0, trace_helpers_1.createReadOnlyWallet)(changeAddress, this.cardano.blockfrostProvider, opts === null || opts === void 0 ? void 0 : opts.walletUtxos, opts === null || opts === void 0 ? void 0 : opts.utxoAddresses);
        return new cip68_contract_1.Cip68Contract({ wallet: wallet });
    }
    async listBatches(profileId) {
        const items = await this.prisma.productBatch.findMany({
            where: { minterProfileId: profileId },
            select: { id: true, name: true, image: true, createdAt: true, metadata: true },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        });
        if (!Array.isArray(items))
            return [];
        const visible = items.filter((b) => {
            const meta = b.metadata;
            const db = meta === null || meta === void 0 ? void 0 : meta._db;
            return !db || db.revoked !== true;
        });
        return visible.map((b) => {
            var _a;
            return ({
                id: b.id,
                name: b.name,
                image: (_a = b.image) !== null && _a !== void 0 ? _a : null,
                createdAt: b.createdAt,
            });
        });
    }
    async mint(params) {
        var _a, _b;
        const contract = this.createContract(params.changeAddress, {
            walletUtxos: params.walletUtxos,
            utxoAddresses: params.utxoAddresses,
        });
        let metadata;
        let receiver;
        if (params.metadata) {
            metadata = params.metadata;
            receiver = (_a = params.receiver) !== null && _a !== void 0 ? _a : params.changeAddress;
        }
        else {
            if (!params.name ||
                !params.image ||
                !((_b = params.receivers) === null || _b === void 0 ? void 0 : _b.length) ||
                !params.receiverLocations ||
                !params.receiverCoordinates ||
                !params.minterLocation ||
                !params.minterCoordinates) {
                throw new common_1.BadRequestException("Cần metadata hoặc đủ (name, image, receivers, receiverLocations, receiverCoordinates, minterLocation, minterCoordinates)");
            }
            const addrObj = (0, core_1.deserializeAddress)(params.changeAddress);
            const receiversPk = params.receivers.map((addr) => (0, core_1.resolvePaymentKeyHash)(addr)).join(",");
            metadata = (0, trace_helpers_1.buildMetadata)({
                pk: addrObj.pubKeyHash,
                receivers: receiversPk,
                receiver_locations: params.receiverLocations,
                receiver_coordinates: params.receiverCoordinates,
                minter_location: params.minterLocation,
                minter_coordinates: params.minterCoordinates,
                name: params.name,
                image: params.image,
                properties: params.propertiesJson,
                standard: "Traceability-v1",
            });
            receiver = params.changeAddress;
        }
        const unsignedTx = await contract.mint([
            { assetName: params.assetName, metadata, quantity: "1", receiver },
        ]);
        return { unsignedTx };
    }
    async update(params) {
        var _a;
        const contract = this.createContract(params.changeAddress, {
            walletUtxos: params.walletUtxos,
            utxoAddresses: params.utxoAddresses,
        });
        let metadata;
        if (params.metadata) {
            metadata = params.metadata;
        }
        else {
            if (!params.name ||
                !params.image ||
                !((_a = params.receivers) === null || _a === void 0 ? void 0 : _a.length) ||
                !params.receiverLocations ||
                !params.receiverCoordinates ||
                !params.minterLocation ||
                !params.minterCoordinates) {
                throw new common_1.BadRequestException("Cần metadata hoặc đủ (name, image, receivers, receiverLocations, receiverCoordinates, minterLocation, minterCoordinates)");
            }
            const addrObj = (0, core_1.deserializeAddress)(params.changeAddress);
            const receiversPk = params.receivers.map((addr) => (0, core_1.resolvePaymentKeyHash)(addr)).join(",");
            metadata = (0, trace_helpers_1.buildMetadata)({
                pk: addrObj.pubKeyHash,
                receivers: receiversPk,
                receiver_locations: params.receiverLocations,
                receiver_coordinates: params.receiverCoordinates,
                minter_location: params.minterLocation,
                minter_coordinates: params.minterCoordinates,
                name: params.name,
                image: params.image,
                properties: params.propertiesJson,
                standard: "Traceability-v1",
            });
        }
        const unsignedTx = await contract.update([
            { assetName: params.assetName, metadata, txHash: params.txHash },
        ]);
        return { unsignedTx };
    }
    async revoke(params) {
        const contract = this.createContract(params.changeAddress, {
            walletUtxos: params.walletUtxos,
            utxoAddresses: params.utxoAddresses,
        });
        const unsignedTx = await contract.revoke([
            { assetName: params.assetName, txHash: params.txHash },
        ]);
        return { unsignedTx };
    }
    async recordTx(params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const { action, txHash, assetName, profileId } = params;
        const prisma = this.prisma;
        if (action === "MINT") {
            const name = (_a = params.name) !== null && _a !== void 0 ? _a : "";
            const image = (_b = params.image) !== null && _b !== void 0 ? _b : "";
            await prisma.productBatch.upsert({
                where: { id: assetName },
                create: {
                    id: assetName,
                    name,
                    image: image || null,
                    standard: (_c = params.standard) !== null && _c !== void 0 ? _c : "Traceability-v1",
                    properties: (_d = params.properties) !== null && _d !== void 0 ? _d : undefined,
                    metadata: (_e = params.metadata) !== null && _e !== void 0 ? _e : undefined,
                    mintTxHash: txHash,
                    minterProfileId: profileId,
                },
                update: {
                    mintTxHash: txHash,
                    name,
                    image: image || null,
                    standard: (_f = params.standard) !== null && _f !== void 0 ? _f : "Traceability-v1",
                    properties: (_g = params.properties) !== null && _g !== void 0 ? _g : undefined,
                    metadata: (_h = params.metadata) !== null && _h !== void 0 ? _h : undefined,
                },
            });
            await prisma.movementLog.create({
                data: { batchId: assetName, action: "MINT", roleAtHop: "minter", txHash, fromProfileId: profileId },
            });
            return;
        }
        const batch = await prisma.productBatch.findUnique({ where: { id: assetName } });
        if (!batch) {
            throw new common_1.BadRequestException(`Batch not found: ${assetName}`);
        }
        if (action === "UPDATE") {
            const nextMetadata = params.metadata && typeof params.metadata === "object"
                ? params.metadata
                : (0, trace_helpers_1.mergeDbMeta)(batch.metadata, {
                    lastUpdateTxHash: txHash,
                    lastUpdateAt: new Date().toISOString(),
                });
            await prisma.productBatch.update({
                where: { id: assetName },
                data: {
                    name: (_j = params.name) !== null && _j !== void 0 ? _j : batch.name,
                    image: (_k = params.image) !== null && _k !== void 0 ? _k : batch.image,
                    standard: (_l = params.standard) !== null && _l !== void 0 ? _l : batch.standard,
                    properties: (_m = params.properties) !== null && _m !== void 0 ? _m : batch.properties,
                    metadata: nextMetadata,
                },
            });
            await prisma.movementLog.create({
                data: { batchId: assetName, action: "UPDATE", roleAtHop: "updater", txHash, fromProfileId: profileId },
            });
            return;
        }
        await prisma.productBatch.update({
            where: { id: assetName },
            data: {
                metadata: (0, trace_helpers_1.mergeDbMeta)(batch.metadata, {
                    revokeTxHash: txHash,
                    revokedAt: new Date().toISOString(),
                    revoked: true,
                }),
            },
        });
        await prisma.movementLog.create({
            data: { batchId: assetName, action: "REVOKE", roleAtHop: "revoker", txHash, fromProfileId: profileId },
        });
    }
    async submitSignedTx(signedTxInput, fromBase64 = false) {
        var _a, _b, _c, _d, _e;
        let cborBuffer;
        if (fromBase64) {
            try {
                cborBuffer = Buffer.from(signedTxInput, "base64");
            }
            catch (_f) {
                throw new common_1.BadRequestException("signedTxBase64 không hợp lệ");
            }
        }
        else {
            let signedTxHex;
            const stripped = signedTxInput.startsWith("0x") ? signedTxInput.slice(2) : signedTxInput.trim();
            let parsed = stripped;
            try {
                if (stripped.startsWith("{"))
                    parsed = JSON.parse(stripped);
            }
            catch (_g) {
                parsed = stripped;
            }
            const str = typeof parsed === "object" && parsed !== null
                ? (_e = (_d = (_c = (_b = (_a = parsed.signedTransaction) !== null && _a !== void 0 ? _a : parsed.cborTx) !== null && _b !== void 0 ? _b : parsed.cbor) !== null && _c !== void 0 ? _c : parsed.tx) !== null && _d !== void 0 ? _d : parsed.transaction) !== null && _e !== void 0 ? _e : stripped
                : stripped;
            const s = String(str);
            const isHex = /^[0-9a-fA-F]+$/.test(s) && s.length % 2 === 0;
            if (isHex) {
                signedTxHex = s;
            }
            else {
                try {
                    const bytes = Buffer.from(s, "base64");
                    signedTxHex = Buffer.from(bytes).toString("hex");
                }
                catch (_h) {
                    throw new common_1.BadRequestException("signedTx phải là hex hoặc base64");
                }
            }
            cborBuffer = Buffer.from(signedTxHex, "hex");
        }
        const first = cborBuffer[0];
        const isCborList = first >= 0x80 && first <= 0x9f;
        const isCborListLong = first === 0x98 && cborBuffer.length > 1;
        if (!isCborList && !isCborListLong) {
            throw new common_1.BadRequestException(`signedTx không phải CBOR tx hợp lệ (byte đầu 0x${first.toString(16).padStart(2, "0")}, độ dài ${cborBuffer.length}). Ví có thể trả format khác.`);
        }
        const txHash = await this.cardano.blockfrostFetcher.submitTx(cborBuffer);
        return { txHash };
    }
};
exports.TraceService = TraceService;
exports.TraceService = TraceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cardano_service_1.CardanoService,
        prisma_service_1.PrismaService])
], TraceService);
//# sourceMappingURL=trace.service.js.map