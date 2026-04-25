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
      evidenceFiles: mapMediaArray(row.evidenceFiles),
      certFiles: mapMediaArray(row.certFiles),
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

async function fetchProfileRow(idFallback: string | number = "me") {
  const { json } = await httpClient(`${BACKEND_URL}/auth/me`, { method: "GET" });
  const profile = (json as any)?.profile ?? {};
  const user = (json as any)?.user ?? {};
  const row = {
    ...profile,
    roleCode: profile?.roleCode ?? user?.roleCode ?? user?.role ?? null,
  };
  return { ...row, id: normalizeId(row, user?.profileId ?? idFallback) };
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
  return {
    production_code: cleanString(data?.code || previousData?.code),
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

export const adminDataProvider: DataProvider = {
  ...baseProvider,
  async getList(resource, params) {
    if (resource === "profile") {
      return {
        data: [await fetchProfileRow("me")],
        total: 1,
      };
    }

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
    if (resource === "profile") {
      return { data: await fetchProfileRow(params.id ?? "me") };
    }

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
    if (resource === "profile") {
      const { json } = await httpClient(`${BACKEND_URL}/profile`, {
        method: "PATCH",
        body: JSON.stringify(params.data),
      });
      const row = (json as any)?.profile ?? json ?? params.data;
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
    return baseProvider.update(resource, params);
  },
  async create(resource, params) {
    if (resource === "profile") {
      const { json } = await httpClient(`${BACKEND_URL}/profile`, {
        method: "POST",
        body: JSON.stringify(params.data),
      });
      const row = (json as any)?.profile ?? json ?? params.data;
      return { data: { ...row, id: normalizeId(row, "me") } };
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
          assetName: String(params.data?.code || "").trim(),
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

    return baseProvider.create(resource, params);
  },
  async delete(resource, params) {
    return baseProvider.delete(resource, params);
  },
};
