import {
  applyParamsToScript,
  deserializeAddress,
  mPubKeyAddress,
  resolveScriptHash,
  serializePlutusScript,
} from '@meshsdk/core';
import * as path from 'path';
import * as fs from 'fs';

const plutusPath = path.join(__dirname, '../../../plutus.json');
const plutusPathAlt = path.join(__dirname, '../../../../plutus.json');
let plutus: any;

if (fs.existsSync(plutusPath)) {
  plutus = JSON.parse(fs.readFileSync(plutusPath, 'utf-8'));
} else if (fs.existsSync(plutusPathAlt)) {
  plutus = JSON.parse(fs.readFileSync(plutusPathAlt, 'utf-8'));
} else {
  throw new Error(
    `plutus.json not found. Tried: ${plutusPath}, ${plutusPathAlt}`,
  );
}

export interface PlutusValidator {
  title: string;
  compiledCode: string;
  hash?: string;
}

export interface PlutusJson {
  validators: PlutusValidator[];
}

export class PlutusHelper {
  private plutusJson: PlutusJson;
  private readonly appNetworkId: number;

  constructor() {
    const network = process.env.APP_NETWORK || 'preprod';
    this.appNetworkId = network === 'mainnet' ? 1 : 0;

    this.plutusJson = plutus as PlutusJson;
    console.log(
      `[PlutusHelper] Loaded ${this.plutusJson?.validators?.length || 0} validators`,
    );
  }

  readValidator(title: string): string {
    const validator = this.plutusJson.validators.find((v) => v.title === title);
    if (!validator) {
      throw new Error(`Validator ${title} not found`);
    }
    return validator.compiledCode;
  }

  getScripts(owners: string[]) {
    const spendCompileCode = this.readValidator('traceability.store.spend');
    const spendScriptCbor = applyParamsToScript(
      spendCompileCode,
      [
        owners.map((owner) =>
          mPubKeyAddress(
            deserializeAddress(owner).pubKeyHash,
            deserializeAddress(owner).stakeCredentialHash,
          ),
        ),
      ],
      'Mesh',
    );
    const spendScript = { code: spendScriptCbor, version: 'V3' as const };
    const contractAddress = serializePlutusScript(
      spendScript,
      undefined,
      this.appNetworkId,
      false,
    ).address;

    const mintCompileCode = this.readValidator('traceability.mint.mint');
    const mintScriptCbor = applyParamsToScript(
      mintCompileCode,
      [
        owners.map((owner) =>
          mPubKeyAddress(
            deserializeAddress(owner).pubKeyHash,
            deserializeAddress(owner).stakeCredentialHash,
          ),
        ),
        mPubKeyAddress(
          deserializeAddress(contractAddress).scriptHash,
          deserializeAddress(contractAddress).stakeCredentialHash,
        ),
      ],
      'Mesh',
    );
    const policyId = resolveScriptHash(mintScriptCbor, 'V3');

    return {
      mintScriptCbor,
      spendScriptCbor,
      policyId,
      contractAddress,
    };
  }
}
