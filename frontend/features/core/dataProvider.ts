"use client";

import { fetchUtils } from "react-admin";
import type { DataProvider } from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";
import {
  getCustodianSettlementAddress,
  publishAttestedRecord,
  signOutgoingAttestation,
} from "@/lib/wallet";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

const resourceToEndpoint: Record<string, string> = {
  production: "productions",
  container: "containers",
  warehouse: "warehouses",
  "warehouse-storage": "warehouse-storages",
  profile: "profile",
};

const httpClient: typeof fetchUtils.fetchJson = async (url, options = {}) => {
  const headers = new Headers(options.headers ?? { Accept: "application/json" });
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetchUtils.fetchJson(url, {
    ...options,
    headers,
    credentials: "include",
  });
};

function mapUrlToBackend(url: string) {
  let mapped = url;
  for (const [resource, endpoint] of Object.entries(resourceToEndpoint)) {
    mapped = mapped.replace(`/${resource}`, `/${endpoint}`);
  }
  return mapped;
}

const baseProvider = simpleRestProvider(BACKEND_URL, (url, options) =>
  httpClient(mapUrlToBackend(url), options),
);

const RESOURCES_WITH_LIST_FALLBACK = new Set([
  "production",
  "container",
  "warehouse",
  "warehouse-storage",
]);

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeId(row: any, fallback: string | number = "1") {
  return row?.id ?? row?.profileId ?? row?.inventoryKey ?? row?.code ?? fallback;
}

function resolveMediaUrl(raw: unknown): string | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const gateway =
    String(
      process.env.NEXT_PUBLIC_PINATA_GATEWAY ||
        process.env.NEXT_PUBLIC_IPFS_GATEWAY ||
        "https://gateway.pinata.cloud",
    ).replace(/\/+$/, "");
  if (value.startsWith("ipfs://")) {
    return `${gateway}/ipfs/${value.slice("ipfs://".length).replace(/^\/+/, "")}`;
  }
  if (value.startsWith("ipfs/")) {
    return `${gateway}/${value.replace(/^\/+/, "")}`;
  }
  return null;
}

function attachMediaUrls(resource: string, row: any) {
  if (!row || typeof row !== "object") return row;
  const mapMediaArray = (raw: unknown) => {
    const shortTitle = (url: string) => {
      const cleaned = String(url || "").trim();
      if (!cleaned) return "file";
      const noQuery = cleaned.split("?")[0];
      const parts = noQuery.split("/").filter(Boolean);
      const last = parts[parts.length - 1] || "file";
      return last.length > 28 ? `${last.slice(0, 12)}...${last.slice(-12)}` : last;
    };
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => {
        const src = resolveMediaUrl(item) || String(item || "").trim();
        if (!src) return null;
        return { src, title: shortTitle(src) };
      })
      .filter(Boolean);
  };
  if (resource === "production") {
    return {
      ...row,
      assetName: cleanString((row as any)?.assetName || (row as any)?.code),
      evidenceFiles: mapMediaArray(row.evidenceFiles),
      certFiles: mapMediaArray(row.certFiles),
    };
  }
  if (resource === "container") {
    return {
      ...row,
      assetName: cleanString((row as any)?.assetName || (row as any)?.code),
    };
  }
  return row;
}

function pickRawFiles(input: any): File[] {
  if (!input) return [];
  if (input instanceof File) return [input];
  if (Array.isArray(input)) {
    return input
      .map((item) => {
        if (item instanceof File) return item;
        if (item?.rawFile instanceof File) return item.rawFile;
        return null;
      })
      .filter((f): f is File => Boolean(f));
  }
  if (input?.rawFile instanceof File) return [input.rawFile];
  return [];
}

async function uploadEvidence(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BACKEND_URL}/media/upload`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { ipfsUri?: string; ipfsUrl?: string };
  const uri = String(data?.ipfsUri || data?.ipfsUrl || "").trim();
  if (!uri) throw new Error("Unable to upload media.");
  return uri;
}

async function getSessionOwnerAndCustodian() {
  const meRes = await httpClient(`${BACKEND_URL}/auth/me`, { method: "GET" });
  const me = meRes.json as any;
  const owner =
    String(me?.user?.paymentAddress || "").trim() ||
    String(me?.user?.walletAddress || "").trim() ||
    String(me?.user?.sub || "").trim();
  const custodianAddress = await getCustodianSettlementAddress();
  return { me, owner, custodianAddress };
}

async function uploadMany(files: File[]) {
  return Promise.all(files.map((file) => uploadEvidence(file)));
}

function ensureUnsignedTxResponse(unsigned: any, fallbackMessage: string) {
  if (!unsigned?.result || !unsigned?.data) {
    throw new Error(unsigned?.message || fallbackMessage);
  }
}

async function signAndPublishUnsignedTx(unsignedCbor: string) {
  const signed = await signOutgoingAttestation(unsignedCbor);
  return publishAttestedRecord(signed);
}

function buildOwnerList(owner: string, custodianAddress: string) {
  return [owner || custodianAddress];
}

function endpointFor(resource: string) {
  return resourceToEndpoint[resource] ?? resource;
}

async function fetchResourceRows(resource: string, query?: URLSearchParams) {
  const endpoint = endpointFor(resource);
  const url = `${BACKEND_URL}/${endpoint}${query && query.size ? `?${query.toString()}` : ""}`;
  const { json } = await httpClient(url, { method: "GET" });
  return Array.isArray(json) ? json : [];
}

function mapRowsWithId(resource: string, rows: any[]) {
  return rows.map((row: any) => ({
    ...attachMediaUrls(resource, row),
    id: normalizeId(row),
  }));
}

function buildProductionMetadata(data: any, previousData: any, certFilesIpfs: string[], evidenceFilesIpfs: string[]) {
  const rawStatus = cleanString(data?.status || previousData?.status).toUpperCase();
  const metadataStatus =
    rawStatus === "CLOSED"
      ? "CLOSED"
      : rawStatus === "UPDATED"
        ? "UPDATED"
        : "CREATED";
  return {
    status: metadataStatus,
    production_code: cleanString(data?.code || data?.assetName || previousData?.code || previousData?.assetName),
    facility: cleanString(data?.facilityId || previousData?.facilityId),
    province: cleanString(data?.provinceId || previousData?.provinceId),
    district: cleanString(data?.districtId || previousData?.districtId),
    farming_method: cleanString(data?.farmingMethod || previousData?.farmingMethod),
    seeding_date: cleanString(data?.seedingDate || previousData?.seedingDate),
    harvest_date: cleanString(data?.harvestDate || previousData?.harvestDate),
    actual_yield_kg: cleanString(data?.actualYieldKg || previousData?.actualYieldKg),
    crop_type: cleanString(data?.cropType || previousData?.cropType),
    variety: cleanString(data?.varietyId || previousData?.varietyId),
    custom_certification_name: cleanString(
      data?.customCertificationName || previousData?.customCertificationName,
    ),
    certifications: JSON.stringify(data?.certifications || previousData?.certifications || []),
    cert_file_cids: JSON.stringify(certFilesIpfs),
    image_cids: JSON.stringify(evidenceFilesIpfs),
  };
}

function buildContainerMetadata(data: any, previousData: any) {
  const rawStatus = cleanString(data?.status || previousData?.status).toUpperCase();
  const metadataStatus =
    rawStatus === "UPDATE"
        ? "UPDATE"
        : "CREATE";
  return {
    status: metadataStatus,
    container_code: cleanString(data?.code || data?.assetName || previousData?.code || previousData?.assetName),
    production_inventory_key: cleanString(data?.productionInventoryKey || previousData?.productionInventoryKey),
    container_type: cleanString(data?.containerType || previousData?.containerType),
    capacity_kg: cleanString(data?.capacityKg || previousData?.capacityKg),
    actual_capacity_kg: cleanString(data?.actualCapacityKg || previousData?.actualCapacityKg),
    product_name: cleanString(data?.productName || previousData?.productName),
    current_province: cleanString(data?.currentProvinceId || previousData?.currentProvinceId),
    current_district: cleanString(data?.currentDistrictId || previousData?.currentDistrictId),
    current_ward: cleanString(data?.currentWardId || previousData?.currentWardId),
    participant_wallet_addresses: JSON.stringify(
      Array.isArray(data?.participantWalletAddresses)
        ? data.participantWalletAddresses.map((x: unknown) => cleanString(x)).filter(Boolean)
        : Array.isArray(previousData?.participantWalletAddresses)
          ? previousData.participantWalletAddresses.map((x: unknown) => cleanString(x)).filter(Boolean)
          : [],
    ),
    participant_location_labels: (Array.isArray(data?.participantLocationLabels)
      ? data.participantLocationLabels.map((x: unknown) => cleanString(x)).filter(Boolean)
      : Array.isArray(previousData?.participantLocationLabels)
        ? previousData.participantLocationLabels.map((x: unknown) => cleanString(x)).filter(Boolean)
        : []
    ).join("; "),
    note: cleanString(data?.note || previousData?.note),
  };
}

function buildWarehouseStorageMetadata(data: any, previousData: any, opType: "IN" | "OUT" | "UPDATE") {
  return {
    storage_op: opType,
    warehouse_id: cleanString(data?.warehouseId || previousData?.warehouseId),
    container_inventory_key: cleanString(data?.containerInventoryKey || data?.productId || previousData?.containerInventoryKey),
    entry_time: cleanString(data?.entryTime || previousData?.entryTime),
    exit_time: cleanString(data?.exitTime || previousData?.exitTime),
    storage_conditions: cleanString(data?.conditions || previousData?.conditions),
  };
}

export const adminDataProvider: DataProvider = {
  ...baseProvider,
  async getList(resource, params) {
    const query = new URLSearchParams();
    if (params.pagination) {
      query.set("page", String(params.pagination.page));
      query.set("perPage", String(params.pagination.perPage));
    }
    const rows = await fetchResourceRows(resource, query);
    return {
      data: mapRowsWithId(resource, rows),
      total: rows.length,
    };
  },
  async getOne(resource, params) {
    if (RESOURCES_WITH_LIST_FALLBACK.has(resource)) {
      const rows = await fetchResourceRows(resource);
      const hit =
        rows.find((r: any) => String(r?.id ?? "") === String(params.id)) ??
        rows.find((r: any) => String(r?.inventoryKey ?? "") === String(params.id));
      if (!hit) {
        throw new Error("Record not found");
      }
      return {
        data: {
          ...attachMediaUrls(resource, hit),
          id: normalizeId(hit, params.id),
        },
      };
    }

    const result = await baseProvider.getOne(resource, params);
    return {
      ...result,
      data: {
        ...attachMediaUrls(resource, result.data),
        id: normalizeId(result.data, params.id),
      },
    };
  },
  async update(resource, params) {
    if (resource === "container") {
      const { owner, custodianAddress } = await getSessionOwnerAndCustodian();
      const inventoryKey = String(
        params.data?.inventoryKey || params.previousData?.inventoryKey || params.id || "",
      ).trim();
      if (!inventoryKey) throw new Error("inventoryKey is required.");
      const metadata = buildContainerMetadata(params.data, params.previousData);
      const owners = buildOwnerList(owner, custodianAddress);
      const contractRes = await httpClient(`${BACKEND_URL}/containers/contract/save`, {
        method: "POST",
        body: JSON.stringify({ custodianAddress, owners, inventoryKey, metadata }),
      });
      const unsigned = contractRes.json as any;
      ensureUnsignedTxResponse(unsigned, "Failed to prepare container save transaction.");
      const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
      const patchRes = await httpClient(`${BACKEND_URL}/containers/${encodeURIComponent(inventoryKey)}`, {
        method: "PATCH",
        body: JSON.stringify({ ...params.data, txHash }),
      });
      const row = patchRes.json as any;
      return { data: { ...row, id: normalizeId(row, params.id) } };
    }
    if (resource === "production") {
      const { owner, custodianAddress } = await getSessionOwnerAndCustodian();
      const owners = buildOwnerList(owner, custodianAddress);
      const inventoryKey = String(
        params.data?.inventoryKey || params.previousData?.inventoryKey || params.id || "",
      ).trim();
      if (!inventoryKey) throw new Error("inventoryKey is required.");

      const certFiles = pickRawFiles((params.data as any)?.certFiles);
      const evidenceFiles = pickRawFiles((params.data as any)?.evidenceFiles);
      const certFilesIpfs = await uploadMany(certFiles);
      const evidenceFilesIpfs = await uploadMany(evidenceFiles);
      const metadata = buildProductionMetadata(
        params.data,
        params.previousData,
        certFilesIpfs,
        evidenceFilesIpfs,
      );
      const contractRes = await httpClient(`${BACKEND_URL}/productions/contract/save`, {
        method: "POST",
        body: JSON.stringify({
          custodianAddress,
          owners,
          inventoryKey,
          metadata,
        }),
      });
      const unsigned = contractRes.json as any;
      ensureUnsignedTxResponse(unsigned, "Failed to prepare production save transaction.");
      const txHash = await signAndPublishUnsignedTx(String(unsigned.data));

      const patchRes = await httpClient(`${BACKEND_URL}/productions/${encodeURIComponent(inventoryKey)}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...params.data,
          txHash,
          certFiles: certFilesIpfs,
          evidenceFiles: evidenceFilesIpfs,
        }),
      });
      const row = patchRes.json as any;
      return { data: { ...row, id: normalizeId(row, params.id) } };
    }
    if (resource === "warehouse-storage") {
      const { owner, custodianAddress } = await getSessionOwnerAndCustodian();
      const owners = buildOwnerList(owner, custodianAddress);
      const inventoryKey = cleanString(
        params.data?.containerInventoryKey ||
        params.data?.productId ||
        params.previousData?.containerInventoryKey ||
        params.previousData?.productId,
      );
      if (!inventoryKey) throw new Error("containerInventoryKey is required.");
      const metadata = buildWarehouseStorageMetadata(params.data, params.previousData, "UPDATE");
      const contractRes = await httpClient(`${BACKEND_URL}/containers/contract/save`, {
        method: "POST",
        body: JSON.stringify({ custodianAddress, owners, inventoryKey, metadata }),
      });
      const unsigned = contractRes.json as any;
      ensureUnsignedTxResponse(unsigned, "Failed to prepare warehouse storage on-chain update.");
      const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
      const result = await baseProvider.update(resource, {
        ...params,
        data: { ...params.data, txHash, containerInventoryKey: inventoryKey },
      });
      return result;
    }
    return baseProvider.update(resource, params);
  },
  async create(resource, params) {
    if (resource === "container") {
      const { owner, custodianAddress } = await getSessionOwnerAndCustodian();
      const metadata = buildContainerMetadata(params.data, null);
      const owners = buildOwnerList(owner, custodianAddress);
      const contractRes = await httpClient(`${BACKEND_URL}/containers/contract/create`, {
        method: "POST",
        body: JSON.stringify({
          custodianAddress,
          owners,
          assetName: String(params.data?.assetName || params.data?.code || "").trim(),
          metadata,
        }),
      });
      const unsigned = contractRes.json as any;
      ensureUnsignedTxResponse(unsigned, "Failed to prepare container on-chain transaction.");
      const txHash = await signAndPublishUnsignedTx(String(unsigned.data));

      const dbRes = await httpClient(`${BACKEND_URL}/containers`, {
        method: "POST",
        body: JSON.stringify({
          ...params.data,
          traceSchemeRef: String(unsigned.traceSchemeRef || "").trim(),
          inventoryKey: String(unsigned.inventoryKey || "").trim(),
          txHash,
        }),
      });
      const row = dbRes.json as any;
      return { data: { ...row, id: normalizeId(row, String(unsigned.inventoryKey || txHash)) } };
    }
    if (resource === "production") {
      const { owner, custodianAddress } = await getSessionOwnerAndCustodian();
      const owners = buildOwnerList(owner, custodianAddress);
      const certFiles = pickRawFiles((params.data as any)?.certFiles);
      const evidenceFiles = pickRawFiles((params.data as any)?.evidenceFiles);
      const certFilesIpfs = await uploadMany(certFiles);
      const evidenceFilesIpfs = await uploadMany(evidenceFiles);
      const metadata = buildProductionMetadata(params.data, null, certFilesIpfs, evidenceFilesIpfs);

      const contractRes = await httpClient(`${BACKEND_URL}/productions/contract/create`, {
        method: "POST",
        body: JSON.stringify({
          custodianAddress,
          owners,
          assetName: String(params.data?.assetName || params.data?.code || "").trim(),
          metadata,
        }),
      });
      const unsigned = contractRes.json as any;
      ensureUnsignedTxResponse(unsigned, "Failed to prepare production on-chain transaction.");
      const txHash = await signAndPublishUnsignedTx(String(unsigned.data));

      const dbRes = await httpClient(`${BACKEND_URL}/productions`, {
        method: "POST",
        body: JSON.stringify({
          ...params.data,
          traceSchemeRef: String(unsigned.traceSchemeRef || "").trim(),
          inventoryKey: String(unsigned.inventoryKey || "").trim(),
          txHash,
          certFiles: certFilesIpfs,
          evidenceFiles: evidenceFilesIpfs,
        }),
      });
      const row = dbRes.json as any;
      return { data: { ...row, id: normalizeId(row, String(unsigned.inventoryKey || txHash)) } };
    }
    if (resource === "warehouse-storage") {
      const { owner, custodianAddress } = await getSessionOwnerAndCustodian();
      const owners = buildOwnerList(owner, custodianAddress);
      const inventoryKey = cleanString(params.data?.containerInventoryKey || params.data?.productId);
      if (!inventoryKey) throw new Error("containerInventoryKey is required.");
      const metadata = buildWarehouseStorageMetadata(params.data, null, "IN");
      const contractRes = await httpClient(`${BACKEND_URL}/containers/contract/save`, {
        method: "POST",
        body: JSON.stringify({ custodianAddress, owners, inventoryKey, metadata }),
      });
      const unsigned = contractRes.json as any;
      ensureUnsignedTxResponse(unsigned, "Failed to prepare warehouse storage on-chain update.");
      const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
      return baseProvider.create(resource, {
        ...params,
        data: { ...params.data, txHash, containerInventoryKey: inventoryKey },
      });
    }


    return baseProvider.create(resource, params);
  },
  async delete(resource, params) {
    if (resource === "container") {
      const { owner, custodianAddress } = await getSessionOwnerAndCustodian();
      const owners = buildOwnerList(owner, custodianAddress);
      const inventoryKey = String((params.previousData as any)?.inventoryKey ?? params.id ?? "").trim();
      if (!inventoryKey) throw new Error("inventoryKey is required.");
      const contractRes = await httpClient(`${BACKEND_URL}/containers/contract/burn`, {
        method: "POST",
        body: JSON.stringify({
          custodianAddress,
          owners,
          containerInventoryKeys: [inventoryKey],
        }),
      });
      const unsigned = contractRes.json as any;
      ensureUnsignedTxResponse(unsigned, "Failed to prepare container burn transaction.");
      const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
      const { json } = await httpClient(`${BACKEND_URL}/containers/${encodeURIComponent(inventoryKey)}`, {
        method: "DELETE",
        body: JSON.stringify({ txHash }),
      });
      const row = json as any;
      return { data: { ...row, id: normalizeId(params.previousData, params.id) } };
    }
    if (resource === "production") {
      const { owner, custodianAddress } = await getSessionOwnerAndCustodian();
      const owners = buildOwnerList(owner, custodianAddress);
      const inventoryKey = String(
        (params.previousData as any)?.inventoryKey ?? params.id ?? "",
      ).trim();
      if (!inventoryKey) throw new Error("inventoryKey is required.");
      const contractRes = await httpClient(`${BACKEND_URL}/productions/contract/burn`, {
        method: "POST",
        body: JSON.stringify({
          custodianAddress,
          owners,
          productionInventoryKeys: [inventoryKey],
        }),
      });
      const unsigned = contractRes.json as any;
      ensureUnsignedTxResponse(unsigned, "Failed to prepare production burn transaction.");
      const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
      const { json } = await httpClient(`${BACKEND_URL}/productions/${encodeURIComponent(inventoryKey)}`, {
        method: "DELETE",
        body: JSON.stringify({ txHash }),
      });
      const row = json as any;
      return { data: { ...row, id: normalizeId(params.previousData, params.id) } };
    }
    if (resource === "warehouse-storage") {
      const { owner, custodianAddress } = await getSessionOwnerAndCustodian();
      const owners = buildOwnerList(owner, custodianAddress);
      const inventoryKey = cleanString(
        (params.previousData as any)?.containerInventoryKey || (params.previousData as any)?.productId,
      );
      if (!inventoryKey) throw new Error("containerInventoryKey is required.");
      const metadata = buildWarehouseStorageMetadata(
        { ...(params.previousData as any), exitTime: new Date().toISOString() },
        params.previousData,
        "OUT",
      );
      const contractRes = await httpClient(`${BACKEND_URL}/containers/contract/save`, {
        method: "POST",
        body: JSON.stringify({ custodianAddress, owners, inventoryKey, metadata }),
      });
      const unsigned = contractRes.json as any;
      ensureUnsignedTxResponse(unsigned, "Failed to prepare warehouse storage on-chain update.");
      const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
      const { json } = await httpClient(`${BACKEND_URL}/warehouse-storages/${encodeURIComponent(String(params.id))}`, {
        method: "DELETE",
        body: JSON.stringify({ txHash }),
      });
      const row = json as any;
      return { data: { ...row, id: normalizeId(params.previousData, params.id) } };
    }
    return baseProvider.delete(resource, params);
  },
};
