import { VALIDATOR_TITLE } from "../../config/config.service";
import type { Plutus } from "../../../shared/types";
export declare function computeMintScriptCborForMinterAddress(minterChangeAddress: string, opts?: {
    plutus?: Plutus;
    networkId?: number;
    title?: typeof VALIDATOR_TITLE;
}): {
    mintScriptCbor: string;
    policyId: string;
};
