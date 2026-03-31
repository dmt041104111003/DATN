"use client";

export type ProductRow = {
  id: string;
  traceSchemeRef: string;
  lotReference: string;
  inventoryKey: string;
  confirmationRef: string;
  custodyParties: string[];
  warehouseId?: string | null;
  name: string;
  description: string;
  roadmap?: string | null;
  location?: string | null;
  imageIpfs?: string | null;
  planInventoryKey?: string | null;
  containerType?: string | null;
  maxWeightValue?: string | null;
  maxWeightUnit?: string | null;
  maxVolumeValue?: string | null;
  maxVolumeUnit?: string | null;
  status?: string;
  createdAt: string;
  updatedAt: string;
  verified?: boolean;
  hasPending?: boolean;
};

