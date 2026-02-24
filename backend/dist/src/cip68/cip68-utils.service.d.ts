import { ConfigService } from "../config/config.service";
export declare class Cip68UtilsService {
    private readonly config;
    constructor(config: ConfigService);
    buildRef100Unit(policyId: string, assetName: string): string;
    datumToJson(datum: string, option?: {
        contain_pk?: boolean;
    }): Promise<unknown>;
    getPkHash(datum: string): Promise<string | null>;
    decodeReceivers(receiversStr: string | undefined): {
        pubKeyHash: string;
    }[];
    ensureReceiversRaw(metadata: Record<string, string>): Record<string, string>;
    metadataForDatum(metadata: Record<string, string>): Record<string, string>;
}
