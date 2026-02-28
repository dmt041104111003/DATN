"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReadOnlyWallet = createReadOnlyWallet;
exports.mergeDbMeta = mergeDbMeta;
exports.buildMetadata = buildMetadata;
const common_1 = require("@nestjs/common");
const MIN_COLLATERAL_LOVELACE = 5000000;
function createReadOnlyWallet(changeAddress, fetcher, walletUtxos, utxoAddresses) {
    const dedupe = (items) => {
        var _a, _b, _c, _d;
        const seen = new Set();
        const out = [];
        for (const u of items) {
            const k = `${(_b = (_a = u.input) === null || _a === void 0 ? void 0 : _a.txHash) !== null && _b !== void 0 ? _b : ""}#${(_d = (_c = u.input) === null || _c === void 0 ? void 0 : _c.outputIndex) !== null && _d !== void 0 ? _d : ""}`;
            if (!k || seen.has(k))
                continue;
            seen.add(k);
            out.push(u);
        }
        return out;
    };
    const getAllUtxos = async () => {
        if (walletUtxos === null || walletUtxos === void 0 ? void 0 : walletUtxos.length)
            return walletUtxos;
        if (utxoAddresses === null || utxoAddresses === void 0 ? void 0 : utxoAddresses.length) {
            const lists = await Promise.all(utxoAddresses.map((a) => fetcher.fetchAddressUTxOs(a)));
            return dedupe(lists.flat());
        }
        return fetcher.fetchAddressUTxOs(changeAddress);
    };
    return {
        getChangeAddress: () => Promise.resolve(changeAddress),
        getUtxos: () => getAllUtxos(),
        getCollateral: async () => {
            const utxos = await getAllUtxos();
            const collateral = utxos.find((u) => {
                var _a, _b, _c;
                const lovelace = (_c = (_b = (_a = u.output) === null || _a === void 0 ? void 0 : _a.amount) === null || _b === void 0 ? void 0 : _b.find((a) => a.unit === "lovelace")) === null || _c === void 0 ? void 0 : _c.quantity;
                return Number(lovelace !== null && lovelace !== void 0 ? lovelace : 0) >= MIN_COLLATERAL_LOVELACE;
            });
            if (!collateral) {
                throw new common_1.BadRequestException(`No UTXO with sufficient collateral (>= ${MIN_COLLATERAL_LOVELACE} lovelace) found`);
            }
            return [collateral];
        },
    };
}
function mergeDbMeta(existing, patch) {
    const base = existing && typeof existing === "object" && !Array.isArray(existing)
        ? existing
        : {};
    const prevDb = base._db && typeof base._db === "object" && !Array.isArray(base._db)
        ? base._db
        : {};
    return Object.assign(Object.assign({}, base), { _db: Object.assign(Object.assign({}, prevDb), patch) });
}
function buildMetadata(opts) {
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
    const meta = {
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
    return meta;
}
//# sourceMappingURL=trace.helpers.js.map