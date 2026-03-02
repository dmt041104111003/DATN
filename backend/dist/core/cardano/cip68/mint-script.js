"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeMintScriptCborForMinterAddress = computeMintScriptCborForMinterAddress;
const core_1 = require("@meshsdk/core");
const config_service_1 = require("../../config/config.service");
function computeMintScriptCborForMinterAddress(minterChangeAddress, opts) {
    var _a, _b, _c;
    const config = new config_service_1.ConfigService();
    const plutus = (_a = opts === null || opts === void 0 ? void 0 : opts.plutus) !== null && _a !== void 0 ? _a : config.getPlutus();
    const networkId = (_b = opts === null || opts === void 0 ? void 0 : opts.networkId) !== null && _b !== void 0 ? _b : config.appNetworkId;
    const t = (_c = opts === null || opts === void 0 ? void 0 : opts.title) !== null && _c !== void 0 ? _c : config.validatorTitle;
    const addr = (0, core_1.deserializeAddress)(minterChangeAddress);
    const pubKeyIssuer = addr.pubKeyHash;
    const stakeCredentialHash = addr.stakeCredentialHash;
    if (!pubKeyIssuer || !stakeCredentialHash) {
        throw new Error("Invalid minterChangeAddress: missing payment or stake credential hash.");
    }
    const readValidator = (title) => {
        const v = plutus.validators.find((vv) => vv.title === title);
        if (!v)
            throw new Error(`${title} validator not found.`);
        return v.compiledCode;
    };
    const storeCompileCode = readValidator(t.store);
    const storeScriptCbor = (0, core_1.applyParamsToScript)(storeCompileCode, [pubKeyIssuer]);
    const storeScript = { code: storeScriptCbor, version: "V3" };
    const storeScriptAddress = (0, core_1.serializePlutusScript)(storeScript, undefined, networkId, false).address;
    const storeScriptHash = (0, core_1.deserializeAddress)(storeScriptAddress).scriptHash;
    const storeAddress = (0, core_1.serializeAddressObj)((0, core_1.scriptAddress)(storeScriptHash, stakeCredentialHash, false), networkId);
    const storeScriptHashWithStake = (0, core_1.deserializeAddress)(storeAddress).scriptHash;
    const mintCompileCode = readValidator(t.mint);
    const mintScriptCbor = (0, core_1.applyParamsToScript)(mintCompileCode, [
        storeScriptHashWithStake,
        stakeCredentialHash,
        pubKeyIssuer,
    ]);
    const policyId = (0, core_1.resolveScriptHash)(mintScriptCbor, "V3");
    return { mintScriptCbor, policyId };
}
//# sourceMappingURL=mint-script.js.map