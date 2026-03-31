export type PlanRow = {
  id: string;
  growingAreaInventoryKey: string;
  growingAreaSnapshot: any;
  inventoryKey: string;
  stage?: "PLANNED" | "HARVESTED" | "PACKAGED" | string;
  harvestedAt?: string | null;
  packagedAt?: string | null;

  nftImageIpfs?: string | null;
  harvestImageIpfs?: string | null;
  packagingImageIpfs?: string | null;

  seedCertificateIpfs?: string | null;
  seedInvoiceIpfs?: string | null;
  nurseryBatch: string;
  plantingBatch: string;
  cropType: string;
  nurseryArea: string;
  plantingArea: string;
  seedQuantityValue: string;
  seedQuantityUnit: string;
  plantQuantityValue: string;
  plantQuantityUnit: string;

  createdBy: string;
  plannedSeedingDate: string;
  plannedPlantingDate: string;
  plannedHarvestDate?: string | null;
  expectedHarvestYield?: string | null;
  plannedProcessingDate?: string | null;
  expectedProcessingYield?: string | null;
  plannedPackagingDate?: string | null;
  expectedPackagingQuantity?: string | null;
  expiryDate?: string | null;
  packagingSpec?: string | null;

  txHash?: string | null;
  verified?: boolean;
  verifiedAt?: string | null;
  retirePending?: boolean;
  harvestPending?: boolean;
  packagingPending?: boolean;

  createdAt?: string;
  updatedAt?: string;
};

