"use client";

import { fetchUtils } from "react-admin";
import { buildProductionMetadata, buildProductionMetadataPatch } from "@/features/core/metadata/productionMetadata";
import { buildContainerMetadata } from "@/features/core/metadata/containerMetadata";
import { buildMappedMetadata } from "@/features/core/metadata/share/buildMappedMetadata";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { getMe } from "@/features/core/authProvider";
import { buildOwnerList } from "@/features/core/onchain/owners/buildOwnerList";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

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

const resolveId = (row: any, fallback: string | number = "1") =>
  row?.id ?? row?.profileId ?? row?.inventoryKey ?? row?.code ?? fallback;

export function getOnchainFlowDeps() {
  return {
    BACKEND_URL,
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
    buildOwnerList,
    buildProductionMetadata,
    buildProductionMetadataPatch,
    buildContainerMetadata,
    buildMappedMetadata,
  };
}
