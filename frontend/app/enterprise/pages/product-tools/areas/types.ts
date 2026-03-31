export type GrowingAreaRow = {
  id: string;
  traceSchemeRef: string;
  inventoryKey: string;
  confirmationRef: string;
  txHash?: string;
  verified?: boolean;
  verifiedAt?: string | null;
  retirePending?: boolean;
  planCount?: number;
  custodyRoster: string;
  registeringCustodianAddress: string;
  name: string;
  location: string;
  nftImageIpfs?: string | null;
  areaSize?: string | null;
  soilType?: string | null;
  createdAt?: string;
};

