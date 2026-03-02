import {
  applyParamsToScript,
  deserializeAddress,
  resolveScriptHash,
  scriptAddress,
  serializeAddressObj,
  serializePlutusScript,
} from "@meshsdk/core";
import { ConfigService, VALIDATOR_TITLE } from "../../config/config.service";
import type { Plutus } from "../../../shared/types";

export function computeMintScriptCborForMinterAddress(
  minterChangeAddress: string,
  opts?: { plutus?: Plutus; networkId?: number; title?: typeof VALIDATOR_TITLE }
): { mintScriptCbor: string; policyId: string } {
  const config = new ConfigService();
  const plutus = opts?.plutus ?? config.getPlutus();
  const networkId = opts?.networkId ?? config.appNetworkId;
  const t = opts?.title ?? config.validatorTitle;

  const addr = deserializeAddress(minterChangeAddress);
  const pubKeyIssuer = addr.pubKeyHash;
  const stakeCredentialHash = addr.stakeCredentialHash;
  if (!pubKeyIssuer || !stakeCredentialHash) {
    throw new Error("Invalid minterChangeAddress: missing payment or stake credential hash.");
  }

  const readValidator = (title: string): string => {
    const v = plutus.validators.find((vv) => vv.title === title);
    if (!v) throw new Error(`${title} validator not found.`);
    return v.compiledCode;
  };

  const storeCompileCode = readValidator(t.store);
  const storeScriptCbor = applyParamsToScript(storeCompileCode, [pubKeyIssuer]);
  const storeScript = { code: storeScriptCbor, version: "V3" as const };
  const storeScriptAddress = serializePlutusScript(
    storeScript,
    undefined,
    networkId,
    false
  ).address;
  const storeScriptHash = deserializeAddress(storeScriptAddress).scriptHash;

  const storeAddress = serializeAddressObj(
    scriptAddress(storeScriptHash, stakeCredentialHash, false),
    networkId
  );
  const storeScriptHashWithStake = deserializeAddress(storeAddress).scriptHash;

  const mintCompileCode = readValidator(t.mint);
  const mintScriptCbor = applyParamsToScript(mintCompileCode, [
    storeScriptHashWithStake,
    stakeCredentialHash,
    pubKeyIssuer,
  ]);

  const policyId = resolveScriptHash(mintScriptCbor, "V3");
  return { mintScriptCbor, policyId };
}

