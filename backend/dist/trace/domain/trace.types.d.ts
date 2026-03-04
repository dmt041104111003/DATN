import type { TraceDisplay } from "../utils";
export type TraceCoreInfo = {
    policyId: string;
    assetName: string;
    standard: string;
    referenceUtxo: string | null;
    batch: {
        name: string;
        description: string | null;
        image: string | null;
        originSiteCode: string | null;
        minterName: string | null;
        minterLocation: string | null;
    };
    certificates: Array<{
        id: number;
        title: string;
        number: string | null;
        authority: string | null;
        expiryDate: string | null;
        documentUrl: string | null;
        issuerName: string | null;
    }>;
};
export type TraceRouteStep = {
    stepIndex: number;
    from: {
        address: string | null;
        name: string | null;
        location: string | null;
    };
    to: {
        address: string | null;
        name: string | null;
        location: string | null;
    };
    carrierName: string | null;
    transportMode: string | null;
    txHash: string | null;
    actualDepartureAt: string | null;
    txCreatedAt: string | null;
    delayedDeclaration: boolean;
};
export type TraceShippingEvidence = {
    id: number;
    status: "IN_TRANSIT" | "DELIVERED" | string;
    lockedInScript: boolean;
    partialSignedByAddress: string | null;
    partialSignedByName: string | null;
    secondSignedByAddress: string | null;
    secondSignedByName: string | null;
    actualPickupAt: string | null;
    actualDeliveryAt: string | null;
};
export type TraceInventoryInfo = {
    status: string | null;
    zone: string | null;
    aisle: string | null;
    rack: string | null;
    bin: string | null;
    burnTxHash: string | null;
    burned: boolean;
};
export type TraceResponse = {
    metadata: Record<string, unknown>;
    properties: Record<string, unknown>;
    certificateUrl: string | null;
    certificate?: {
        id: number;
        title: string;
        imageUrl: string | null;
        issuedAt: string;
        batchId: string;
    };
    lifecycle: {
        completed: boolean;
        checkpointsPassed: Array<{
            step: number;
            label: string;
            txHash?: string;
            completed: boolean;
        }>;
        missingCheckpoints: string[];
    };
    burnStatus: "active" | "burned";
    mapData?: Array<{
        lat: number;
        lng: number;
        label: string;
        status: "completed" | "pending";
        pointType?: "origin" | "receiver" | "script" | "outside";
    }>;
    currentLocation?: {
        address: string;
        label: string;
        lat: number | null;
        lng: number | null;
        locationType?: "minter" | "receiver" | "script" | "outside";
        unverified?: boolean;
    };
    display?: TraceDisplay;
    core?: TraceCoreInfo;
    route?: {
        steps: TraceRouteStep[];
    };
    shipping?: {
        deliveries: TraceShippingEvidence[];
    };
    inventory?: TraceInventoryInfo | null;
};
