export interface PlutusValidator {
    title: string;
    compiledCode: string;
    hash?: string;
}
export interface PlutusJson {
    validators: PlutusValidator[];
}
export declare class PlutusHelper {
    private plutusJson;
    private readonly appNetworkId;
    constructor();
    readValidator(title: string): string;
    getScripts(owners: string[]): {
        mintScriptCbor: string;
        spendScriptCbor: string;
        policyId: string;
        contractAddress: string;
    };
}
