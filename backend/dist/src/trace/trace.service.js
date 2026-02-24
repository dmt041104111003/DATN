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
const common_1 = require("@nestjs/common");
const cardano_service_1 = require("../cardano/cardano.service");
const config_service_1 = require("../config/config.service");
const cip68_contract_1 = require("../cip68/cip68.contract");
const MIN_COLLATERAL_LOVELACE = 5000000;
function createReadOnlyWallet(changeAddress, fetcher) {
    return {
        getChangeAddress: () => Promise.resolve(changeAddress),
        getUtxos: () => fetcher.fetchAddressUTxOs(changeAddress),
        getCollateral: async () => {
            const utxos = await fetcher.fetchAddressUTxOs(changeAddress);
            const collateral = utxos.find((u) => {
                var _a, _b, _c;
                const lovelace = (_c = (_b = (_a = u.output) === null || _a === void 0 ? void 0 : _a.amount) === null || _b === void 0 ? void 0 : _b.find((a) => a.unit === "lovelace")) === null || _c === void 0 ? void 0 : _c.quantity;
                return Number(lovelace !== null && lovelace !== void 0 ? lovelace : 0) >= MIN_COLLATERAL_LOVELACE;
            });
            if (!collateral) {
                throw new common_1.BadRequestException(`No UTXO with sufficient collateral (>= ${MIN_COLLATERAL_LOVELACE} lovelace) found at changeAddress`);
            }
            return [collateral];
        },
    };
}
const PREFIX_REF100 = config_service_1.CIP68_PREFIX.REFERENCE_100;
const PREFIX_222 = config_service_1.CIP68_PREFIX.USER_222;
let TraceService = class TraceService {
    constructor(cardano) {
        this.cardano = cardano;
    }
    createContractForAddress(changeAddress) {
        const fetcher = this.cardano.blockfrostProvider;
        const wallet = createReadOnlyWallet(changeAddress, fetcher);
        return new cip68_contract_1.Cip68Contract({ wallet: wallet });
    }
    hexToUtf8(hex) {
        try {
            return Buffer.from(hex, "hex").toString("utf8");
        }
        catch (_a) {
            return hex;
        }
    }
    assetNameFromUnit(policyId, unit) {
        if (!unit.startsWith(policyId) || unit.length <= policyId.length + 8)
            return null;
        const afterPolicy = unit.slice(policyId.length);
        const prefix = afterPolicy.slice(0, 8);
        const hexName = afterPolicy.slice(8);
        if (!hexName)
            return { prefix, name: "" };
        return { prefix, name: this.hexToUtf8(hexName) };
    }
    async listAssetsByPolicy(policyId) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const fetcher = this.cardano.blockfrostFetcher;
        const raw = await fetcher.fetchAssetsByPolicy(policyId);
        const byLogicalName = new Map();
        for (const { asset: unit, quantity } of raw) {
            if (!unit.startsWith(policyId))
                continue;
            const parsed = this.assetNameFromUnit(policyId, unit);
            if (!parsed)
                continue;
            const { prefix, name } = parsed;
            if (prefix === PREFIX_REF100) {
                let row = byLogicalName.get(name);
                if (!row) {
                    row = {};
                    byLogicalName.set(name, row);
                }
                row.ref100 = { unit, quantity };
            }
            else if (prefix === PREFIX_222) {
                let row = byLogicalName.get(name);
                if (!row) {
                    row = {};
                    byLogicalName.set(name, row);
                }
                row.nft222 = { unit, quantity };
            }
        }
        const rows = [];
        for (const [assetName, row] of byLogicalName.entries()) {
            rows.push({
                assetName,
                ref100Unit: (_b = (_a = row.ref100) === null || _a === void 0 ? void 0 : _a.unit) !== null && _b !== void 0 ? _b : null,
                ref100Quantity: (_d = (_c = row.ref100) === null || _c === void 0 ? void 0 : _c.quantity) !== null && _d !== void 0 ? _d : "0",
                nft222Unit: (_f = (_e = row.nft222) === null || _e === void 0 ? void 0 : _e.unit) !== null && _f !== void 0 ? _f : null,
                nft222Quantity: (_h = (_g = row.nft222) === null || _g === void 0 ? void 0 : _g.quantity) !== null && _h !== void 0 ? _h : "0",
            });
        }
        rows.sort((a, b) => a.assetName.localeCompare(b.assetName));
        return rows;
    }
    async mint(params) {
        var _a;
        const contract = this.createContractForAddress(params.changeAddress);
        const receiver = (_a = params.receiver) !== null && _a !== void 0 ? _a : params.changeAddress;
        const unsignedTx = await contract.mint([
            {
                assetName: params.assetName,
                metadata: params.metadata,
                quantity: "1",
                receiver,
            },
        ]);
        return { unsignedTx };
    }
    async update(params) {
        const contract = this.createContractForAddress(params.changeAddress);
        const unsignedTx = await contract.update([
            { assetName: params.assetName, metadata: params.metadata, txHash: params.txHash },
        ]);
        return { unsignedTx };
    }
    async burn(params) {
        var _a;
        const contract = this.createContractForAddress(params.changeAddress);
        const unsignedTx = await contract.burn([
            { assetName: params.assetName, quantity: (_a = params.quantity) !== null && _a !== void 0 ? _a : "-1", txHash: params.txHash },
        ]);
        return { unsignedTx };
    }
    async revoke(params) {
        const contract = this.createContractForAddress(params.changeAddress);
        const unsignedTx = await contract.revoke([
            { assetName: params.assetName, txHash: params.txHash },
        ]);
        return { unsignedTx };
    }
    async submitSignedTx(signedTxHex) {
        const txHash = await this.cardano.blockfrostProvider.submitTx(signedTxHex);
        return { txHash };
    }
    buildMetadata(opts) {
        var _a;
        let properties = {};
        if (opts.properties) {
            try {
                properties = JSON.parse(opts.properties);
            }
            catch (_b) {
                properties = {};
            }
        }
        if (properties.current_holder_id === undefined) {
            properties.current_holder_id = opts.pk;
        }
        return {
            name: opts.name,
            image: opts.image,
            standard: (_a = opts.standard) !== null && _a !== void 0 ? _a : "Traceability-v1",
            properties: JSON.stringify(properties),
            _pk: opts.pk,
            receivers: opts.receivers,
            receiver_locations: opts.receiver_locations,
            receiver_coordinates: opts.receiver_coordinates,
            minter_location: opts.minter_location,
            minter_coordinates: opts.minter_coordinates,
        };
    }
};
exports.TraceService = TraceService;
exports.TraceService = TraceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cardano_service_1.CardanoService])
], TraceService);
//# sourceMappingURL=trace.service.js.map