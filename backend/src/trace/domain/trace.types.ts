import type { TraceDisplay } from "../utils";

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
};

