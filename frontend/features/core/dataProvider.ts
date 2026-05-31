"use client";

import { fetchUtils } from "react-admin";
import type { DataProvider } from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";
import { buildProductionMetadata, buildProductionMetadataPatch } from "@/features/core/metadata/productionMetadata";
import { buildContainerMetadata } from "@/features/core/metadata/containerMetadata";
import { buildMappedMetadata } from "@/features/core/metadata/share/buildMappedMetadata";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { updateContainerOnchain } from "@/features/core/onchain/module/update/container";
import { updateProductionOnchain } from "@/features/core/onchain/module/update/production";
import { createContainerOnchain } from "@/features/core/onchain/module/create/container";
import { createProductionOnchain } from "@/features/core/onchain/module/create/production";
import { createWarehouseStorageOnchain } from "@/features/core/onchain/module/create/warehouseStorage";
import { deleteWarehouseStorageViaOutOnchain } from "@/features/core/onchain/module/update/warehouseStorageOut";
import { deleteContainerOnchain } from "@/features/core/onchain/module/delete/container";
import { deleteProductionOnchain } from "@/features/core/onchain/module/delete/production";
import { getMe } from "@/features/core/authProvider";
import { buildOwnerList } from "@/features/core/onchain/owners/buildOwnerList";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

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

const baseProvider = simpleRestProvider(BACKEND_URL, (url, options) =>
  httpClient(url, options),
);

const RESOURCES_WITH_LIST_FALLBACK = new Set([
  "production",
  "container",
  "warehouse",
  "warehouse-storage",
]);
const resolveId = (row: any, fallback: string | number = "1") =>
  row?.id ?? row?.profileId ?? row?.inventoryKey ?? row?.code ?? fallback;

function getOnchainFlowDeps() {
  return {
    BACKEND_URL,
    baseProvider,
    httpClient,
    cleanString,
    normalizeId: resolveId,
    getSessionOwner: async () => {
      const me = (await getMe()) as any;
      const owner =
        cleanString(me?.user?.paymentAddress) ||
        cleanString(me?.user?.walletAddress) ||
        cleanString(me?.user?.sub);
      return { me, owner };
    },
    uploadMany: async (files: File[] = []) =>
      Promise.all(files.map(async (file) => {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`${BACKEND_URL}/media/upload`, { method: "POST", credentials: "include", body: form });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { ipfsUri?: string; ipfsUrl?: string };
        const uri = cleanString(data?.ipfsUri || data?.ipfsUrl);
        if (!uri) throw new Error("Unable to upload media.");
        return uri;
      })),
    pickRawFiles: (input: any): File[] =>
      (Array.isArray(input) ? input : [])
        .map((item) => item?.rawFile)
        .filter((f): f is File => f instanceof File),
    normalizeIpfsUriList: (input: unknown): string[] =>
      Array.from(new Set(
        (Array.isArray(input) ? input : [])
          .map((item: any) => cleanString(typeof item === "string" ? item : item?.src || item?.url))
          .filter(Boolean),
      )),
    buildOwnerList,
    buildProductionMetadata,
    buildProductionMetadataPatch,
    buildContainerMetadata,
    buildMappedMetadata,
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
    const url = `${BACKEND_URL}/${resource}${query && query.size ? `?${query.toString()}` : ""}`;
    const { json } = await httpClient(url, { method: "GET" });
    const payload = (json as any) || {};
    let rows = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
    const filterWarehouseId = cleanString(params.filter?.warehouseId);
    if (resource === "warehouse-storage" && filterWarehouseId) {
      rows = rows.filter((row: any) => cleanString(row?.warehouseId) === filterWarehouseId);
    }
    const totalFromPayload = Number(payload.total);
    const total = Number.isFinite(totalFromPayload) ? totalFromPayload : rows.length;
    const page = Number(params.pagination?.page || 1);
    const perPage = Number(params.pagination?.perPage || rows.length || 1);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pagedRows = rows.slice(start, end);
    return {
      data: (pagedRows || []).map((row: any) => ({ ...row, id: resolveId(row) })),
      total,
    };
  },
  async getOne(resource, params) {
    if (RESOURCES_WITH_LIST_FALLBACK.has(resource)) {
      const url = `${BACKEND_URL}/${resource}`;
      const { json } = await httpClient(url, { method: "GET" });
      const rows = Array.isArray(json) ? json : [];
      const hit =
        rows.find((r: any) => String(r?.id ?? "") === String(params.id)) ??
        rows.find((r: any) => String(r?.inventoryKey ?? "") === String(params.id));
      if (!hit) {
        throw new Error("Record not found");
      }
      return {
        data: {
          ...hit,
          id: resolveId(hit, params.id),
        },
      };
    }

    const result = await baseProvider.getOne(resource, params);
    return {
      ...result,
      data: {
        ...result.data,
        id: resolveId(result.data, params.id),
      },
    };
  },
  async update(resource, params) {
    if (resource === "warehouse") {
      const warehouseId = cleanString(params.id);
      if (!warehouseId) throw new Error("warehouse id is required.");
      const patchRes = await httpClient(`${BACKEND_URL}/warehouse/${encodeURIComponent(warehouseId)}`, {
        method: "PATCH",
        body: JSON.stringify(params.data || {}),
      });
      const row = patchRes.json as any;
      return { data: { ...row, id: resolveId(row, params.id) } };
    }
    if (resource === "container") return updateContainerOnchain(params, getOnchainFlowDeps());
    if (resource === "production") return updateProductionOnchain(params, getOnchainFlowDeps());
    if (resource === "warehouse-storage") return createWarehouseStorageOnchain({ ...params, data: params.data || {} }, getOnchainFlowDeps());
    return baseProvider.update(resource, params);
  },
  async create(resource, params) {
    if (resource === "warehouse") {
      throw new Error("Tạo kho chỉ khi đăng ký tài khoản. Vào mục Kho lưu trữ để sửa kho hiện có.");
    }
    if (resource === "container") return createContainerOnchain(params, getOnchainFlowDeps());
    if (resource === "production") return createProductionOnchain(params, getOnchainFlowDeps());
    if (resource === "warehouse-storage") return createWarehouseStorageOnchain(params, getOnchainFlowDeps());
    return baseProvider.create(resource, params);
  },
  async delete(resource, params) {
    if (resource === "warehouse") {
      throw new Error("Không thể xóa kho. Mỗi tài khoản chỉ có một kho — hãy cập nhật thông tin kho.");
    }
    if (resource === "container") return deleteContainerOnchain(params, getOnchainFlowDeps());
    if (resource === "production") return deleteProductionOnchain(params, getOnchainFlowDeps());
    if (resource === "warehouse-storage") return deleteWarehouseStorageViaOutOnchain(params, getOnchainFlowDeps());
    return baseProvider.delete(resource, params);
  },
};
