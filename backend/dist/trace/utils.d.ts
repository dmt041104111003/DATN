export type ParsedCoordinate = {
    lat: number;
    lng: number;
};
export type TraceDisplay = {
    name?: string;
    standard?: string;
    image?: string;
    imageUrl?: string;
    minter_location?: string;
    receiver_locations?: string[];
    receiver_coordinates?: string;
    minter_coordinates?: string;
    properties?: Record<string, unknown>;
};
export declare function buildNft222Unit(policyId: string, assetName: string, prefix222: string): string;
export declare function decodeHexToUtf8(value: unknown): string;
export declare function parseOneCoordinate(coordsStr: string | undefined): ParsedCoordinate | null;
export declare function parseCoordinates(coordsStr: string | undefined): ParsedCoordinate[];
export declare function buildDisplay(metadata: Record<string, unknown>, properties: Record<string, unknown>, minterLocation: string, receiverLocations: string[], batchImage: string | null): TraceDisplay;
