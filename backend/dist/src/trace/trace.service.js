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
    async listMyWarehouseInventory(profileId) {
        const prisma = this.prisma;
        const rows = await prisma.nftInventory.findMany({
            where: {
                profileId,
                OR: [
                    { status: "IN_WAREHOUSE" },
                    { status: null },
                ],
            },
            include: { batch: { select: { id: true, name: true, image: true, policyId: true } } },
            orderBy: { mintedAt: "desc" },
        });
        return (rows || []).map((inv) => {
            var _a, _b, _c, _d, _e, _f, _g;
            return ({
                batchId: inv.batchId,
                batchName: (_b = (_a = inv.batch) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : inv.batchId,
                image: (_d = (_c = inv.batch) === null || _c === void 0 ? void 0 : _c.image) !== null && _d !== void 0 ? _d : null,
                quantity: (_e = inv.quantity) !== null && _e !== void 0 ? _e : 1,
                mintedAt: inv.mintedAt,
                policyId: (_g = (_f = inv.batch) === null || _f === void 0 ? void 0 : _f.policyId) !== null && _g !== void 0 ? _g : null,
            });
        });
    }
    async getLockRecipientByRoadmap(profileId, batchId) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const prisma = this.prisma;
        const bid = (batchId || "").trim();
        if (!bid)
            return { recipientAddress: null };
        const profile = await prisma.profile.findUnique({
            where: { id: profileId },
            select: { walletAddress: true },
        });
        if (!(profile === null || profile === void 0 ? void 0 : profile.walletAddress))
            return { recipientAddress: null };
        const senderWallet = profile.walletAddress.trim().toLowerCase();
        const batch = await prisma.productBatch.findUnique({
            where: { id: bid },
            select: {
                minterProfileId: true,
                minterProfile: { select: { walletAddress: true } },
            },
        });
        if (!batch)
            return { recipientAddress: null };
        const minterWallet = (_c = (_b = (_a = batch.minterProfile) === null || _a === void 0 ? void 0 : _a.walletAddress) === null || _b === void 0 ? void 0 : _b.trim().toLowerCase()) !== null && _c !== void 0 ? _c : "";
        if (minterWallet && senderWallet === minterWallet) {
            const firstHop = await prisma.roadmap.findFirst({
                where: { batchId: bid },
                orderBy: { hopIndex: "asc" },
                select: { receiverAddress: true },
            });
            return {
                recipientAddress: (_e = (_d = firstHop === null || firstHop === void 0 ? void 0 : firstHop.receiverAddress) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : null,
            };
        }
        const myHop = await prisma.roadmap.findMany({
            where: { batchId: bid },
            orderBy: { hopIndex: "asc" },
            select: { hopIndex: true, receiverAddress: true },
        });
        const idx = myHop.findIndex((r) => (r.receiverAddress || "").trim().toLowerCase() === senderWallet);
        if (idx < 0 || idx >= myHop.length - 1)
            return { recipientAddress: null };
        const next = (_h = (_g = (_f = myHop[idx + 1]) === null || _f === void 0 ? void 0 : _f.receiverAddress) === null || _g === void 0 ? void 0 : _g.trim()) !== null && _h !== void 0 ? _h : null;
        return { recipientAddress: next };
    }
    async mint(params) {
        var _a, _b, _c;
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
                throw new common_1.BadRequestException("Need metadata or all of (name, image, receivers, receiverLocations, receiverCoordinates, minterLocation, minterCoordinates)");
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
        const policyId = (_c = contract.policyId) !== null && _c !== void 0 ? _c : undefined;
        return { unsignedTx, policyId };
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
                throw new common_1.BadRequestException("Need metadata or all of (name, image, receivers, receiverLocations, receiverCoordinates, minterLocation, minterCoordinates)");
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
    async burn(params) {
        const contract = this.createContract(params.changeAddress, {
            walletUtxos: params.walletUtxos,
            utxoAddresses: params.utxoAddresses,
        });
        const balance = await contract.getRftBalanceAtAddress(params.changeAddress, params.assetName, params.policyId);
        if (balance < 1) {
            throw new common_1.BadRequestException("Wallet does not hold this NFT. Burn is only allowed if the wallet has the NFT.");
        }
        const unsignedTx = await contract.burn([
            {
                assetName: params.assetName,
                quantity: "1",
                txHash: params.txHash,
            },
        ]);
        return { unsignedTx };
    }
    async recordTx(params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const { action, txHash, assetName, profileId } = params;
        const prisma = this.prisma;
        if (action === "MINT") {
            const name = (_a = params.name) !== null && _a !== void 0 ? _a : "";
            const image = (_b = params.image) !== null && _b !== void 0 ? _b : "";
            const properties = params.properties != null ? params.properties : {};
            const metadata = params.metadata != null && typeof params.metadata === "object"
                ? params.metadata
                : { name, image, standard: (_c = params.standard) !== null && _c !== void 0 ? _c : "Traceability-v1" };
            await prisma.productBatch.upsert({
                where: { id: assetName },
                create: {
                    id: assetName,
                    name,
                    image: image || null,
                    standard: (_d = params.standard) !== null && _d !== void 0 ? _d : "Traceability-v1",
                    properties,
                    metadata,
                    mintTxHash: txHash,
                    policyId: (_e = params.policyId) !== null && _e !== void 0 ? _e : undefined,
                    minterProfileId: profileId,
                },
                update: {
                    mintTxHash: txHash,
                    name,
                    image: image || null,
                    standard: (_f = params.standard) !== null && _f !== void 0 ? _f : "Traceability-v1",
                    properties,
                    metadata,
                    policyId: (_g = params.policyId) !== null && _g !== void 0 ? _g : undefined,
                },
            });
            await prisma.movementLog.create({
                data: { batchId: assetName, action: "MINT", roleAtHop: "minter", txHash, fromProfileId: profileId },
            });
            const receivers = (_h = params.receivers) !== null && _h !== void 0 ? _h : [];
            if (receivers.length > 0) {
                await prisma.roadmap.createMany({
                    data: receivers.map((receiverAddress, hopIndex) => ({
                        batchId: assetName,
                        receiverAddress,
                        hopIndex,
                        action: "MINT",
                        txHash,
                    })),
                });
            }
            await prisma.nftInventory.upsert({
                where: {
                    batchId_profileId: { batchId: assetName, profileId },
                },
                create: {
                    batchId: assetName,
                    profileId,
                    quantity: 1,
                },
                update: { quantity: { increment: 1 } },
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
            const nextProperties = params.properties != null ? params.properties : (_j = batch.properties) !== null && _j !== void 0 ? _j : {};
            await prisma.productBatch.update({
                where: { id: assetName },
                data: {
                    name: (_k = params.name) !== null && _k !== void 0 ? _k : batch.name,
                    image: (_l = params.image) !== null && _l !== void 0 ? _l : batch.image,
                    standard: (_m = params.standard) !== null && _m !== void 0 ? _m : batch.standard,
                    properties: nextProperties,
                    metadata: nextMetadata,
                },
            });
            await prisma.movementLog.create({
                data: { batchId: assetName, action: "UPDATE", roleAtHop: "updater", txHash, fromProfileId: profileId },
            });
            const receivers = (_o = params.receivers) !== null && _o !== void 0 ? _o : [];
            if (receivers.length > 0) {
                await prisma.roadmap.createMany({
                    data: receivers.map((receiverAddress, hopIndex) => ({
                        batchId: assetName,
                        receiverAddress,
                        hopIndex,
                        action: "UPDATE",
                        txHash,
                    })),
                });
            }
            return;
        }
        if (action === "REVOKE") {
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
            const receivers = (_p = params.receivers) !== null && _p !== void 0 ? _p : [];
            if (receivers.length > 0) {
                await prisma.roadmap.createMany({
                    data: receivers.map((receiverAddress, hopIndex) => ({
                        batchId: assetName,
                        receiverAddress,
                        hopIndex,
                        action: "REVOKE",
                        txHash,
                    })),
                });
            }
            return;
        }
        if (action === "BURN") {
            await prisma.productBatch.update({
                where: { id: assetName },
                data: {
                    metadata: (0, trace_helpers_1.mergeDbMeta)(batch.metadata, {
                        burnTxHash: txHash,
                        burnedAt: new Date().toISOString(),
                        burned: true,
                    }),
                },
            });
            await prisma.movementLog.create({
                data: { batchId: assetName, action: "BURN", roleAtHop: "burner", txHash, fromProfileId: profileId },
            });
            await this.removeOneFromWarehouse(profileId, assetName);
            return;
        }
    }
    async removeOneFromWarehouse(profileId, batchId) {
        const prisma = this.prisma;
        await prisma.nftInventory.deleteMany({
            where: { batchId, profileId },
        });
    }
    async markAsShipped(profileId, batchId) {
        const prisma = this.prisma;
        await prisma.nftInventory.updateMany({
            where: { batchId, profileId },
            data: { status: "SHIPPED" },
        });
    }
    async addToWarehouse(profileId, batchId) {
        const prisma = this.prisma;
        await prisma.nftInventory.upsert({
            where: { batchId_profileId: { batchId, profileId } },
            create: { batchId, profileId, quantity: 1 },
            update: { quantity: { increment: 1 } },
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
                throw new common_1.BadRequestException("signedTxBase64 is invalid");
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
                    throw new common_1.BadRequestException("signedTx must be hex or base64");
                }
            }
            cborBuffer = Buffer.from(signedTxHex, "hex");
        }
        const first = cborBuffer[0];
        const isCborList = first >= 0x80 && first <= 0x9f;
        const isCborListLong = first === 0x98 && cborBuffer.length > 1;
        if (!isCborList && !isCborListLong) {
            throw new common_1.BadRequestException(`signedTx is not valid CBOR tx (first byte 0x${first.toString(16).padStart(2, "0")}, length ${cborBuffer.length}). Wallet may return a different format.`);
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