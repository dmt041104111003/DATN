import type { Network } from "@meshsdk/core";
import type { Plutus } from "../../shared/types";
export declare const VALIDATOR_TITLE: {
    readonly mint: "mint.mint.mint";
    readonly store: "store.store.spend";
};
export declare const CIP68_PREFIX: {
    readonly REFERENCE_100: "000643b0";
    readonly USER_222: "000de140";
};
export declare class ConfigService {
    private _plutus;
    get blockfrostApiKey(): string;
    get koiosToken(): string;
    get appNetwork(): Network;
    get appNetworkId(): number;
    get pinataApiKey(): string;
    get pinataSecretKey(): string;
    get pinataJwt(): string;
    get pinataGateway(): string;
    get ipfsEndpoint(): string;
    get ipfsGateway(): string;
    get mintReferenceScriptHash(): string;
    get storeReferenceScriptHash(): string;
    get validatorTitle(): typeof VALIDATOR_TITLE;
    get cip68Prefix(): typeof CIP68_PREFIX;
    get jwtSecret(): string;
    get cloudinaryCloudName(): string;
    get cloudinaryApiKey(): string;
    get cloudinaryApiSecret(): string;
    getPlutus(): Plutus;
}
