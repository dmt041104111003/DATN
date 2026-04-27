"use client";

import { fetchUtils } from "react-admin";
import type { DataProvider } from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";
import {
  getCustodianSettlementAddress,
  publishAttestedRecord,
  signOutgoingAttestation,
} from "@/lib/wallet";
import { captureCurrentGpsLocation } from "@/features/resources/shared/location";

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
  const entries = Object.entries(resourceToEndpoint).sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [resource, endpoint] of entries) {
    const escaped = resource.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|/)${escaped}(?=/|$)`);
    mapped = mapped.replace(pattern, `$1${endpoint}`);
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

function toCip68SafeText(value: unknown) {
  const raw = cleanString(value);
  if (!raw) return "";
  if (/^[0-9a-f]+$/i.test(raw) && raw.length % 2 === 0) {
    const num = Number(raw);
    if (Number.isFinite(num)) {
      return `${raw}.0`;
    }
  }
  return raw;
}

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((x) => cleanString(x)).filter(Boolean);
  const raw = cleanString(value);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((x) => cleanString(x)).filter(Boolean);
  } catch {}
  return raw
    .split(";")
    .map((x) => cleanString(x))
    .filter(Boolean);
}

function normalizeTripleKey(raw: unknown): string {
  const parts = cleanString(raw)
    .split(",")
    .map((x) => cleanString(x))
    .filter(Boolean);
  if (parts.length < 3) return "";
  return `${parts[0]},${parts[1]},${parts[2]}`;
}

function parseParticipantLocationLabels(raw: unknown): string[] {
  const text = cleanString(raw);
  if (!text) return [];
  return Array.from(
    new Set(
      text
        .split(";")
        .map((x) => normalizeTripleKey(x))
        .filter(Boolean),
    ),
  );
}

function parseParticipantWalletAddresses(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((x) => cleanString(x).toLowerCase()).filter(Boolean);
  const text = cleanString(raw);
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return Array.from(new Set(parsed.map((x) => cleanString(x).toLowerCase()).filter(Boolean)));
    }
  } catch {}
  return [];
}

function parseLocationTriple(raw: unknown): string {
  const value = cleanString(raw);
  if (!value) return "";
  const parts = value
    .split(",")
    .map((x) => cleanString(x))
    .filter(Boolean);
  if (parts.length < 3) return "";
  return `${parts[0]}, ${parts[1]}, ${parts[2]}`;
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
  const values = [cleanString(owner), cleanString(custodianAddress)].filter(Boolean);
  return Array.from(new Set(values));
}

function buildOwnersFromParticipantData(
  source: any,
  fallbackOwner: string,
  fallbackCustodian: string,
) {
  const fromRows = Array.isArray(source?.participantRows)
    ? source.participantRows
        .map((row: any) => cleanString(row?.walletAddress))
        .filter(Boolean)
    : [];
  const fromField = parseStringList(source?.participantWalletAddresses).map((x) =>
    cleanString(x),
  );
  const participants = Array.from(new Set([...fromRows, ...fromField].filter(Boolean)));
  if (participants.length) return participants;
  return buildOwnerList(fallbackOwner, fallbackCustodian);
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

async function fetchContainerByInventoryKey(inventoryKeyRaw: unknown) {
  const inventoryKey = cleanString(inventoryKeyRaw);
  if (!inventoryKey) return null;
  const rows = await fetchResourceRows("container");
  return rows.find((r: any) => cleanString(r?.inventoryKey) === inventoryKey) || null;
}

async function fetchProductionByInventoryKey(inventoryKeyRaw: unknown) {
  const inventoryKey = cleanString(inventoryKeyRaw);
  if (!inventoryKey) return null;
  const rows = await fetchResourceRows("production");
  return rows.find((r: any) => cleanString(r?.inventoryKey) === inventoryKey) || null;
}

async function enforceWarehouseStorageRoadmapGuards(inventoryKey: string, warehouseIdRaw: unknown, gpsTriple: string) {
  const warehouseId = cleanString(warehouseIdRaw);
  if (!warehouseId) {
    throw new Error("warehouseId is required.");
  }

  const [warehouses, traceRes, meRes] = await Promise.all([
    fetchResourceRows("warehouse"),
    httpClient(`${BACKEND_URL}/trace/${encodeURIComponent(inventoryKey)}`, { method: "GET" }),
    httpClient(`${BACKEND_URL}/auth/me`, { method: "GET" }),
  ]);

  const warehouse = (warehouses || []).find((row: any) => cleanString(row?.id) === warehouseId);
  const warehouseLocationTriple = parseLocationTriple(warehouse?.location);
  if (!warehouseLocationTriple) {
    throw new Error("Kho chưa có location hợp lệ dạng 'tỉnh, quận, xã'.");
  }

  const traceJson = traceRes.json as any;
  const meJson = meRes.json as any;
  const lotPassport = (traceJson?.lotPassport || {}) as Record<string, unknown>;
  const roadmapRaw = lotPassport.participant_location_labels;
  const roadmapTriples = parseParticipantLocationLabels(roadmapRaw);
  if (roadmapTriples.length === 0) {
    throw new Error(cleanString(traceJson?.message));
  }
  if (!roadmapTriples.includes(normalizeTripleKey(gpsTriple))) {
    throw new Error("GPS hiện tại không khớp roadmap NFT.");
  }
  if (!roadmapTriples.includes(normalizeTripleKey(warehouseLocationTriple))) {
    throw new Error("Location kho không khớp roadmap NFT.");
  }

  const whitelistRaw = lotPassport.participant_wallet_addresses;
  const whitelist = parseParticipantWalletAddresses(whitelistRaw);
  const currentWallet =
    cleanString(meJson?.user?.paymentAddress) ||
    cleanString(meJson?.user?.walletAddress) ||
    cleanString(meJson?.user?.sub);
  if (!currentWallet) {
    throw new Error("Không xác định được ví người dùng hiện tại.");
  }
  if (!whitelist.includes(currentWallet.toLowerCase())) {
    throw new Error("Ví hiện tại không thuộc participant_wallet_addresses.");
  }
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
    location: cleanString(data?.location || previousData?.location),
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
    capacity_kg: toCip68SafeText(data?.capacityKg || previousData?.capacityKg),
    actual_capacity_kg: toCip68SafeText(data?.actualCapacityKg || previousData?.actualCapacityKg),
    product_name: cleanString(data?.productName || previousData?.productName),
    participant_wallet_addresses: JSON.stringify(
      parseStringList(
        data?.participantWalletAddresses !== undefined
          ? data?.participantWalletAddresses
          : previousData?.participantWalletAddresses,
      ),
    ),
    participant_location_labels: parseStringList(
      data?.participantLocationLabels !== undefined
        ? data?.participantLocationLabels
        : previousData?.participantLocationLabels,
    ).join("; "),
    note: cleanString(data?.note || previousData?.note),
  };
}

function buildWarehouseStorageMetadata(data: any, previousData: any, opType: "IN" | "OUT" | "UPDATE") {
  const nowIso = new Date().toISOString();
  const createdAt = cleanString(previousData?.createdAt || data?.createdAt) || nowIso;
  const updatedAt = nowIso;
  return {
    storage_op: opType,
    warehouse_id: cleanString(data?.warehouseId || previousData?.warehouseId),
    container_inventory_key: cleanString(data?.containerInventoryKey || data?.productId || previousData?.containerInventoryKey),
    current_location: cleanString(data?.location || previousData?.location),
    storage_created_at: createdAt,
    storage_updated_at: updatedAt,
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
    if (resource === "warehouse") {
      const warehouseId = cleanString(params.id);
      if (!warehouseId) throw new Error("warehouse id is required.");
      const patchRes = await httpClient(`${BACKEND_URL}/warehouses/${encodeURIComponent(warehouseId)}`, {
        method: "PATCH",
        body: JSON.stringify(params.data || {}),
      });
      const row = patchRes.json as any;
      return { data: { ...row, id: normalizeId(row, params.id) } };
    }
    if (resource === "container") {
      const { owner, custodianAddress } = await getSessionOwnerAndCustodian();
      const inventoryKey = String(
        params.data?.inventoryKey || params.previousData?.inventoryKey || params.id || "",
      ).trim();
      if (!inventoryKey) throw new Error("inventoryKey is required.");
      const currentContainer = await fetchContainerByInventoryKey(inventoryKey);
      const base = currentContainer || params.previousData || {};
      const mergedForMetadata = { ...base, ...(params.data || {}) };
      const metadata = buildContainerMetadata(mergedForMetadata, base);
      const owners = buildOwnersFromParticipantData(mergedForMetadata, owner, custodianAddress);
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
      const currentProduction = await fetchProductionByInventoryKey(inventoryKey);
      const base = currentProduction || params.previousData || {};
      const mergedForMetadata = { ...base, ...(params.data || {}) };

      const certFiles = pickRawFiles((params.data as any)?.certFiles);
      const evidenceFiles = pickRawFiles((params.data as any)?.evidenceFiles);
      const certFilesIpfs = await uploadMany(certFiles);
      const evidenceFilesIpfs = await uploadMany(evidenceFiles);
      const metadata = buildProductionMetadata(
        mergedForMetadata,
        base,
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
      const inventoryKey = cleanString(
        params.data?.containerInventoryKey ||
        params.data?.productId ||
        params.previousData?.containerInventoryKey ||
        params.previousData?.productId,
      );
      if (!inventoryKey) throw new Error("containerInventoryKey is required.");
      const gps = await captureCurrentGpsLocation();
      const gpsTriple = [gps.provinceId, gps.districtId, gps.wardId].filter(Boolean).join(", ");
      await enforceWarehouseStorageRoadmapGuards(
        inventoryKey,
        params.data?.warehouseId || params.previousData?.warehouseId,
        gpsTriple,
      );
      const containerBase = (await fetchContainerByInventoryKey(inventoryKey)) || {};
      const owners = buildOwnersFromParticipantData(containerBase, owner, custodianAddress);
      const fullContainerMetadata = buildContainerMetadata(containerBase, containerBase);
      const metadata = {
        ...fullContainerMetadata,
        ...buildWarehouseStorageMetadata(params.data, params.previousData, "UPDATE"),
      };
      const contractRes = await httpClient(`${BACKEND_URL}/containers/contract/save`, {
        method: "POST",
        body: JSON.stringify({ custodianAddress, owners, inventoryKey, metadata }),
      });
      const unsigned = contractRes.json as any;
      ensureUnsignedTxResponse(unsigned, "Failed to prepare warehouse storage on-chain update.");
      const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
      const storageId = cleanString(params.id);
      if (!storageId) throw new Error("warehouse-storage id is required.");
      const patchRes = await httpClient(
        `${BACKEND_URL}/warehouse-storages/${encodeURIComponent(storageId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ ...params.data, txHash, containerInventoryKey: inventoryKey }),
        },
      );
      const row = patchRes.json as any;
      return { data: { ...row, id: normalizeId(row, params.id) } };
    }
    return baseProvider.update(resource, params);
  },
  async create(resource, params) {
    if (resource === "container") {
      const { owner, custodianAddress } = await getSessionOwnerAndCustodian();
      const metadata = buildContainerMetadata(params.data, null);
      const owners = buildOwnersFromParticipantData(params.data, owner, custodianAddress);
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
      const inventoryKey = cleanString(params.data?.containerInventoryKey || params.data?.productId);
      if (!inventoryKey) throw new Error("containerInventoryKey is required.");
      const gps = await captureCurrentGpsLocation();
      const location = [gps.provinceId, gps.districtId, gps.wardId].filter(Boolean).join(", ");
      await enforceWarehouseStorageRoadmapGuards(inventoryKey, params.data?.warehouseId, location);
      const createPayload = { ...params.data, location };
      const containerBase = (await fetchContainerByInventoryKey(inventoryKey)) || {};
      const owners = buildOwnersFromParticipantData(containerBase, owner, custodianAddress);
      const fullContainerMetadata = buildContainerMetadata(containerBase, containerBase);
      const metadata = {
        ...fullContainerMetadata,
        ...buildWarehouseStorageMetadata(createPayload, null, "IN"),
      };
      const contractRes = await httpClient(`${BACKEND_URL}/containers/contract/save`, {
        method: "POST",
        body: JSON.stringify({ custodianAddress, owners, inventoryKey, metadata }),
      });
      const unsigned = contractRes.json as any;
      ensureUnsignedTxResponse(unsigned, "Failed to prepare warehouse storage on-chain update.");
      const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
      return baseProvider.create(resource, {
        ...params,
        data: { ...createPayload, txHash, containerInventoryKey: inventoryKey },
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
      const inventoryKey = cleanString(
        (params.previousData as any)?.containerInventoryKey || (params.previousData as any)?.productId,
      );
      if (!inventoryKey) throw new Error("containerInventoryKey is required.");
      const gps = await captureCurrentGpsLocation();
      const location = [gps.provinceId, gps.districtId, gps.wardId].filter(Boolean).join(", ");
      await enforceWarehouseStorageRoadmapGuards(
        inventoryKey,
        (params.previousData as any)?.warehouseId,
        location,
      );
      const containerBase = (await fetchContainerByInventoryKey(inventoryKey)) || {};
      const owners = buildOwnersFromParticipantData(containerBase, owner, custodianAddress);
      const fullContainerMetadata = buildContainerMetadata(containerBase, containerBase);
      const metadata = {
        ...fullContainerMetadata,
        ...buildWarehouseStorageMetadata(
        { ...(params.previousData as any), location },
        params.previousData,
        "OUT",
      ),
      };
      const contractRes = await httpClient(`${BACKEND_URL}/containers/contract/save`, {
        method: "POST",
        body: JSON.stringify({ custodianAddress, owners, inventoryKey, metadata }),
      });
      const unsigned = contractRes.json as any;
      ensureUnsignedTxResponse(unsigned, "Failed to prepare warehouse storage on-chain update.");
      const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
      const { json } = await httpClient(`${BACKEND_URL}/warehouse-storages/${encodeURIComponent(String(params.id))}`, {
        method: "DELETE",
        body: JSON.stringify({ txHash, location }),
      });
      const row = json as any;
      return { data: { ...row, id: normalizeId(params.previousData, params.id) } };
    }
    return baseProvider.delete(resource, params);
  },
};
