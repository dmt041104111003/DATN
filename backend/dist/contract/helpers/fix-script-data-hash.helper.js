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
exports.fixScriptDataHashInTx = fixScriptDataHashInTx;
const CSL = __importStar(require("@emurgo/cardano-serialization-lib-nodejs"));
function collectUsedLanguages(witness) {
    const languages = CSL.Languages.new();
    const scripts = witness.plutus_scripts();
    if (!scripts)
        return languages;
    const seen = new Set();
    for (let i = 0; i < scripts.len(); i++) {
        const kind = scripts.get(i).language_version().kind();
        if (seen.has(kind))
            continue;
        seen.add(kind);
        if (kind === CSL.LanguageKind.PlutusV1)
            languages.add(CSL.Language.new_plutus_v1());
        else if (kind === CSL.LanguageKind.PlutusV2)
            languages.add(CSL.Language.new_plutus_v2());
        else if (kind === CSL.LanguageKind.PlutusV3)
            languages.add(CSL.Language.new_plutus_v3());
    }
    return languages;
}
function fixScriptDataHashInTx(txHex, costmdls) {
    const clean = txHex.trim().replace(/^0x/i, '');
    const tx = CSL.Transaction.from_hex(clean);
    const body = tx.body();
    const witness = tx.witness_set();
    const redeemers = witness.redeemers();
    if (!redeemers || redeemers.len() === 0)
        return clean;
    let languages = collectUsedLanguages(witness);
    if (languages.len() === 0) {
        languages = CSL.Languages.new();
        if (costmdls.get(CSL.Language.new_plutus_v3())) {
            languages.add(CSL.Language.new_plutus_v3());
        }
    }
    if (languages.len() === 0)
        return clean;
    const scoped = costmdls.retain_language_versions(languages);
    const datums = witness.plutus_data();
    const hash = CSL.hash_script_data(redeemers, scoped, datums && datums.len() > 0 ? datums : undefined);
    body.set_script_data_hash(hash);
    const fixed = CSL.Transaction.new(body, witness, tx.auxiliary_data());
    fixed.set_is_valid(tx.is_valid());
    return fixed.to_hex();
}
//# sourceMappingURL=fix-script-data-hash.helper.js.map