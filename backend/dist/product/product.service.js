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
exports.ProductService = void 0;
const core_1 = require("@meshsdk/core");
const common_1 = require("@nestjs/common");
const cardano_service_1 = require("../core/cardano/cardano.service");
const warehouse_service_1 = require("../warehouse/warehouse.service");
const cip68_contract_1 = require("../core/cardano/cip68/cip68.contract");
const mint_script_1 = require("../core/cardano/cip68/mint-script");
const product_helpers_1 = require("./product.helpers");
const product_repository_1 = require("./domain/product.repository");
const list_batches_use_case_1 = require("./application/use-cases/list-batches.use-case");
const record_product_tx_use_case_1 = require("./application/use-cases/record-product-tx.use-case");
const list_roadmap_use_case_1 = require("./application/use-cases/list-roadmap.use-case");
let ProductService = class ProductService {
    constructor(cardano, warehouse, productRepository, listBatchesUseCase, recordProductTxUseCase, listRoadmapUseCase) {
        this.cardano = cardano;
        this.warehouse = warehouse;
        this.productRepository = productRepository;
        this.listBatchesUseCase = listBatchesUseCase;
        this.recordProductTxUseCase = recordProductTxUseCase;
        this.listRoadmapUseCase = listRoadmapUseCase;
    }
    createContract(changeAddress, opts) {
        const wallet = (0, product_helpers_1.createReadOnlyWallet)(changeAddress, this.cardano.blockfrostProvider, opts === null || opts === void 0 ? void 0 : opts.walletUtxos, opts === null || opts === void 0 ? void 0 : opts.utxoAddresses);
        return new cip68_contract_1.Cip68Contract(Object.assign({ wallet: wallet }, ((opts === null || opts === void 0 ? void 0 : opts.minterMintScriptCbor) ? { minterMintScriptCbor: opts.minterMintScriptCbor } : {})));
    }
    async listBatches(profileId) {
        return this.listBatchesUseCase.execute(profileId);
    }
    async listRoadmap(batchCode) {
        return this.listRoadmapUseCase.execute(batchCode);
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
            metadata = (0, product_helpers_1.buildMetadata)({
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
            metadata = Object.assign({}, params.metadata);
            if (params.certUnit != null && params.certUnit.trim() !== "") {
                metadata._cert_unit = params.certUnit.trim();
            }
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
            metadata = (0, product_helpers_1.buildMetadata)({
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
        var _a, _b;
        let minterMintScriptCbor;
        if (params.policyId) {
            const minterAddr = await this.productRepository.getMinterWalletAddressByBatchCode(params.assetName);
            if (minterAddr) {
                try {
                    minterMintScriptCbor = (0, mint_script_1.computeMintScriptCborForMinterAddress)(minterAddr).mintScriptCbor;
                }
                catch (_c) {
                    minterMintScriptCbor = undefined;
                }
            }
        }
        const contract = this.createContract(params.changeAddress, {
            walletUtxos: params.walletUtxos,
            utxoAddresses: params.utxoAddresses,
            minterMintScriptCbor,
        });
        if ((_a = params.walletUtxos) === null || _a === void 0 ? void 0 : _a.length) {
            const policyIdToUse = (_b = params.policyId) !== null && _b !== void 0 ? _b : contract.policyId;
            if (policyIdToUse) {
                const nameHex = Buffer.from(params.assetName, "utf8").toString("hex");
                const unit = `${policyIdToUse}000de140${nameHex}`;
                const bal = params.walletUtxos.reduce((sum, u) => {
                    var _a, _b;
                    const amt = (_b = (_a = u === null || u === void 0 ? void 0 : u.output) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : [];
                    const inUtxo = Array.isArray(amt)
                        ? amt.reduce((s, a) => { var _a; return (a === null || a === void 0 ? void 0 : a.unit) === unit ? s + Number((_a = a.quantity) !== null && _a !== void 0 ? _a : 0) : s; }, 0)
                        : 0;
                    return sum + inUtxo;
                }, 0);
                if (bal < 1) {
                    throw new common_1.BadRequestException(`Wallet does not hold CIP-68 label 222 token for "${params.assetName}" (unit ${unit}).`);
                }
            }
        }
        const unsignedTx = await contract.burn([
            {
                assetName: params.assetName,
                quantity: "1",
                txHash: params.txHash,
                policyId: params.policyId,
            },
        ]);
        return { unsignedTx };
    }
    async getBatchSummaryByCode(code) {
        const batch = await this.productRepository.findBatchByCode(code);
        if (!batch) {
            throw new common_1.BadRequestException(`Batch not found: ${code}`);
        }
        return {
            policyId: batch.policyId,
            assetName: batch.code,
            nftUnit: null,
        };
    }
    async recordTx(params) {
        return this.recordProductTxUseCase.execute(params);
    }
    async removeOneFromWarehouse(profileId, batchId) {
        return this.warehouse.removeOneFromWarehouse(profileId, batchId);
    }
    async addToWarehouse(profileId, batchId) {
        return this.warehouse.addToWarehouse(profileId, batchId);
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
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(product_repository_1.PRODUCT_REPOSITORY)),
    __metadata("design:paramtypes", [cardano_service_1.CardanoService,
        warehouse_service_1.WarehouseService, Object, list_batches_use_case_1.ListBatchesUseCase,
        record_product_tx_use_case_1.RecordProductTxUseCase,
        list_roadmap_use_case_1.ListRoadmapUseCase])
], ProductService);
//# sourceMappingURL=product.service.js.map