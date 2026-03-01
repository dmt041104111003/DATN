import "dotenv/config";
export type PolicyAssetRow = {
    assetName: string;
    ref100Unit: string | null;
    ref100Quantity: string;
    nft222Unit: string | null;
    nft222Quantity: string;
};
