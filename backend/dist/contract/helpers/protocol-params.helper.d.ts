import * as CSL from '@emurgo/cardano-serialization-lib-nodejs';
type CostModelsRaw = Record<string, number[]>;
export declare function costmdlsFromBlockfrostRaw(raw: CostModelsRaw | null | undefined): CSL.Costmdls;
export declare function fetchOnChainCostmdls(apiKey: string, network: string): Promise<CSL.Costmdls>;
export {};
