"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.costmdlsFromBlockfrostRaw = costmdlsFromBlockfrostRaw;
exports.fetchOnChainCostmdls = fetchOnChainCostmdls;
const CSL = __importStar(require("@emurgo/cardano-serialization-lib-nodejs"));
let cachedCostmdls = null;
const CACHE_TTL_MS = 5 * 60 * 1000;
function blockfrostBaseUrl(network) {
    const net = network === 'mainnet' ? 'mainnet' : 'preprod';
    return `https://cardano-${net}.blockfrost.io/api/v0`;
}
function costmdlsFromBlockfrostRaw(raw) {
    const costmdls = CSL.Costmdls.new();
    for (const lang of ['PlutusV1', 'PlutusV2', 'PlutusV3']) {
        const costs = raw?.[lang];
        if (!Array.isArray(costs) || costs.length === 0)
            continue;
        const model = CSL.CostModel.from_json(JSON.stringify(costs.map(String)));
        const language = lang === 'PlutusV1'
            ? CSL.Language.new_plutus_v1()
            : lang === 'PlutusV2'
                ? CSL.Language.new_plutus_v2()
                : CSL.Language.new_plutus_v3();
        costmdls.insert(language, model);
    }
    return costmdls;
}
async function fetchOnChainCostmdls(apiKey, network) {
    const now = Date.now();
    if (cachedCostmdls && now - cachedCostmdls.at < CACHE_TTL_MS) {
        return cachedCostmdls.costmdls;
    }
    const res = await fetch(`${blockfrostBaseUrl(network)}/epochs/latest/parameters`, {
        headers: { project_id: apiKey },
    });
    if (!res.ok) {
        throw new Error(`Không tải được protocol parameters (${res.status}).`);
    }
    const data = (await res.json());
    const costmdls = costmdlsFromBlockfrostRaw(data.cost_models_raw);
    if (costmdls.len() === 0) {
        throw new Error('Blockfrost không trả về cost_models_raw.');
    }
    cachedCostmdls = { at: now, costmdls };
    return costmdls;
}
//# sourceMappingURL=protocol-params.helper.js.map