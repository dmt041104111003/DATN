import { cleanString } from "./share/cleanString";
import { buildMappedMetadata } from "./share/buildMappedMetadata";
import { toCip68SafeText } from "./share/toCip68SafeText";

import type { SignerContext } from "@/features/core/onchain/signerContext";
import { signerContextToMetadata } from "@/features/core/onchain/signerContext";

export function buildProductionMetadata(
  data: any,
  previousData: any,
  evidenceFilesIpfs: string[],
  owners?: string[],
  signer?: SignerContext | null,
) {
  const rawStatus = cleanString(data?.status || previousData?.status).toUpperCase();
  const metadataStatus =
    rawStatus === "CLOSED"
      ? "CLOSED"
      : rawStatus === "UPDATED"
        ? "UPDATED"
        : "CREATED";
  return buildMappedMetadata({
    status: metadataStatus,
    production_code: data?.code || previousData?.code,
    facility: data?.facilityId || previousData?.facilityId,
    location: data?.location || previousData?.location,
    farming_method: data?.farmingMethod || previousData?.farmingMethod,
    seeding_date: data?.seedingDate || previousData?.seedingDate,
    harvest_date: data?.harvestDate || previousData?.harvestDate,
    actual_yield_kg: data?.actualYieldKg || previousData?.actualYieldKg,
    crop_type: data?.cropType || previousData?.cropType,
    variety: data?.varietyId || previousData?.varietyId,
    custom_certification_name: data?.customCertificationName || previousData?.customCertificationName,
    certifications: JSON.stringify(data?.certifications || previousData?.certifications || []),
    image_cids: JSON.stringify(evidenceFilesIpfs),
    owners: JSON.stringify(Array.isArray(owners) ? owners : []),
    ...(signer ? signerContextToMetadata(signer) : {}),
  });
}

export function buildProductionMetadataPatch(
  data: any,
  previousData: any,
  uploadedEvidenceFilesIpfs: string[],
  owners: string[],
  signer?: SignerContext | null,
) {
  const patch: Record<string, string> = {};
  const setIfChanged = (key: string, nextValue: unknown, prevValue: unknown) => {
    const next = toCip68SafeText(nextValue);
    const prev = toCip68SafeText(prevValue);
    if (next !== prev) patch[key] = next;
  };

  const nextStatusRaw = cleanString(data?.status || previousData?.status).toUpperCase();
  const prevStatusRaw = cleanString(previousData?.status).toUpperCase();
  const nextStatus = nextStatusRaw === "CLOSED" ? "CLOSED" : nextStatusRaw === "UPDATED" ? "UPDATED" : "CREATED";
  const prevStatus = prevStatusRaw === "CLOSED" ? "CLOSED" : prevStatusRaw === "UPDATED" ? "UPDATED" : "CREATED";

  setIfChanged("status", nextStatus, prevStatus);
  setIfChanged("production_code", data?.code || previousData?.code, previousData?.code);
  setIfChanged("facility", data?.facilityId || previousData?.facilityId, previousData?.facilityId);
  setIfChanged("location", data?.location || previousData?.location, previousData?.location);
  setIfChanged("farming_method", data?.farmingMethod || previousData?.farmingMethod, previousData?.farmingMethod);
  setIfChanged("seeding_date", data?.seedingDate || previousData?.seedingDate, previousData?.seedingDate);
  setIfChanged("harvest_date", data?.harvestDate || previousData?.harvestDate, previousData?.harvestDate);
  setIfChanged("actual_yield_kg", data?.actualYieldKg || previousData?.actualYieldKg, previousData?.actualYieldKg);
  setIfChanged("crop_type", data?.cropType || previousData?.cropType, previousData?.cropType);
  setIfChanged("variety", data?.varietyId || previousData?.varietyId, previousData?.varietyId);
  setIfChanged(
    "custom_certification_name",
    data?.customCertificationName || previousData?.customCertificationName,
    previousData?.customCertificationName,
  );
  setIfChanged(
    "certifications",
    JSON.stringify(data?.certifications || previousData?.certifications || []),
    JSON.stringify(previousData?.certifications || []),
  );
  setIfChanged("owners", JSON.stringify(Array.isArray(owners) ? owners : []), previousData?.owners || "");

  if (uploadedEvidenceFilesIpfs.length > 0) {
    patch.image_cids = toCip68SafeText(JSON.stringify(uploadedEvidenceFilesIpfs));
  }

  if (signer) {
    patch.signer_wallet = toCip68SafeText(signer.signerWallet);
    patch.signer_location_label = toCip68SafeText(signer.signerLocationLabel);
    patch.signer_role = toCip68SafeText(signer.signerRole);
  }

  return patch;
}
