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
exports.PlutusHelper = void 0;
const core_1 = require("@meshsdk/core");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const plutusPath = path.join(__dirname, '../../../plutus.json');
const plutusPathAlt = path.join(__dirname, '../../../../plutus.json');
let plutus;
if (fs.existsSync(plutusPath)) {
    plutus = JSON.parse(fs.readFileSync(plutusPath, 'utf-8'));
}
else if (fs.existsSync(plutusPathAlt)) {
    plutus = JSON.parse(fs.readFileSync(plutusPathAlt, 'utf-8'));
}
else {
    throw new Error(`Không tìm thấy plutus.json. Đã thử: ${plutusPath}, ${plutusPathAlt}`);
}
class PlutusHelper {
    constructor() {
        const network = process.env.APP_NETWORK || 'preprod';
        this.appNetworkId = network === 'mainnet' ? 1 : 0;
        this.plutusJson = plutus;
        console.log(`[Production.PlutusHelper] Loaded ${this.plutusJson?.validators?.length || 0} validators`);
    }
    readValidator(title) {
        const validator = this.plutusJson.validators.find((v) => v.title === title);
        if (!validator) {
            throw new Error(`Không tìm thấy validator "${title}".`);
        }
        return validator.compiledCode;
    }
    getScripts(owners) {
        const spendCompileCode = this.readValidator('traceability.store.spend');
        const spendScriptCbor = (0, core_1.applyParamsToScript)(spendCompileCode, [
            owners.map((owner) => (0, core_1.mPubKeyAddress)((0, core_1.deserializeAddress)(owner).pubKeyHash, (0, core_1.deserializeAddress)(owner).stakeCredentialHash)),
        ], 'Mesh');
        const spendScript = { code: spendScriptCbor, version: 'V3' };
        const contractAddress = (0, core_1.serializePlutusScript)(spendScript, undefined, this.appNetworkId, false).address;
        const mintCompileCode = this.readValidator('traceability.mint.mint');
        const mintScriptCbor = (0, core_1.applyParamsToScript)(mintCompileCode, [
            owners.map((owner) => (0, core_1.mPubKeyAddress)((0, core_1.deserializeAddress)(owner).pubKeyHash, (0, core_1.deserializeAddress)(owner).stakeCredentialHash)),
            (0, core_1.mPubKeyAddress)((0, core_1.deserializeAddress)(contractAddress).scriptHash, (0, core_1.deserializeAddress)(contractAddress).stakeCredentialHash),
        ], 'Mesh');
        const policyId = (0, core_1.resolveScriptHash)(mintScriptCbor, 'V3');
        return { mintScriptCbor, spendScriptCbor, policyId, contractAddress };
    }
}
exports.PlutusHelper = PlutusHelper;
//# sourceMappingURL=plutus.helper.js.map