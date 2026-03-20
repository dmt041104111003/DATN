"use client";

import * as React from "react";
import { ref100Unit } from "@/lib/cip68";
import { TablePagination } from "@/components/TablePagination";
import {
  getWalletChangeAddress,
  signTxWithEternl,
  submitSignedTxHex,
} from "@/lib/wallet";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type OrderRow = {
  id: string;
  assetUnit: string;
  policyId: string;
  assetName: string;
  senderWalletAddress: string;
  receiverWalletAddress: string;
  txHash?: string | null;
  status: "PENDING" | "SHIPPED" | "RECEIVED" | "CANCELLED";
  receiverWarehouseId?: string | null;
  createdAt: string;
  updatedAt: string;
};

type WarehouseOption = {
  id: string;
  code: string;
  name: string;
  maxAssets?: number | null;
  assetCount?: number;
};

export function OrderTables({ tab }: { tab: "sent" | "incoming" }) {
  const [sentRows, setSentRows] = React.useState<OrderRow[]>([]);
  const [incomingRows, setIncomingRows] = React.useState<OrderRow[]>([]);
  const [warehouses, setWarehouses] = React.useState<WarehouseOption[]>([]);
  const [receiveWarehouseIdByOrderId, setReceiveWarehouseIdByOrderId] =
    React.useState<Record<string, string>>({});
  const [receiveLocationByOrderId, setReceiveLocationByOrderId] =
    React.useState<Record<string, string>>({});
  const [traceMetaByOrderId, setTraceMetaByOrderId] = React.useState<
    Record<string, Record<string, unknown>>
  >({});
  const [loadingTrace, setLoadingTrace] = React.useState<
    Record<string, boolean>
  >({});
  const [loadingTables, setLoadingTables] = React.useState(false);
  const [confirmingOrderId, setConfirmingOrderId] = React.useState<
    string | null
  >(null);
  const [deletingOrderId, setDeletingOrderId] = React.useState<string | null>(
    null,
  );
  const [error, setError] = React.useState("");
  const [profileLocation, setProfileLocation] = React.useState<string | null>(
    null,
  );
  const [sentPage, setSentPage] = React.useState(1);
  const [incomingPage, setIncomingPage] = React.useState(1);
  const PAGE_SIZE = 10;


  const fetchRef100Metadata = React.useCallback(
    async (policyId: string, assetName: string) => {
      const pid = (policyId || "").trim();
      const name = (assetName || "").trim();
      if (!pid || !name) return null as Record<string, unknown> | null;
      const referenceUnit = ref100Unit(pid, name);
      const res = await fetch(
        `${BACKEND_URL}/trace/${encodeURIComponent(referenceUnit)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { metadata?: Record<string, unknown> };
      return (data?.metadata || null) as Record<string, unknown> | null;
    },
    [],
  );

  const fetchTraceMetaForOrder = React.useCallback(
    async (order: OrderRow) => {
      if (!order?.policyId || !order?.assetName) return;
      if (traceMetaByOrderId[order.id]) return;
      setLoadingTrace((prev) => ({ ...prev, [order.id]: true }));
      try {
        const referenceUnit = ref100Unit(order.policyId, order.assetName);
        const res = await fetch(
          `${BACKEND_URL}/trace/${encodeURIComponent(referenceUnit)}`,
          {
            cache: "no-store",
          },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          metadata?: Record<string, unknown>;
        };
        const meta = (data?.metadata || {}) as Record<string, unknown>;
        setTraceMetaByOrderId((prev) => ({ ...prev, [order.id]: meta }));

        if (profileLocation?.trim()) {
          setReceiveLocationByOrderId((prev) =>
            prev[order.id] ? prev : { ...prev, [order.id]: profileLocation.trim() },
          );
        }
      } finally {
        setLoadingTrace((prev) => ({ ...prev, [order.id]: false }));
      }
    },
    [traceMetaByOrderId, profileLocation],
  );

  const loadTables = React.useCallback(async () => {
    setLoadingTables(true);
    try {
      const [sentRes, incomingRes, whRes] = await Promise.all([
        fetch(`${BACKEND_URL}/order/sent`, {
          method: "POST",
          credentials: "include",
        }),
        fetch(`${BACKEND_URL}/order/incoming`, {
          method: "POST",
          credentials: "include",
        }),
        fetch(`${BACKEND_URL}/warehouses`, {
          cache: "no-store",
          credentials: "include",
        }),
      ]);

      if (sentRes.ok) {
        const data = (await sentRes.json()) as OrderRow[];
        setSentRows(Array.isArray(data) ? data : []);
      }
      if (incomingRes.ok) {
        const data = (await incomingRes.json()) as OrderRow[];
        const rows = Array.isArray(data) ? data : [];
        setIncomingRows(rows);
        rows
          .filter((r) => r.status === "SHIPPED")
          .forEach((r) => {
            fetchTraceMetaForOrder(r).catch(() => null);
          });
      }
      if (whRes.ok) {
        const data = (await whRes.json()) as WarehouseOption[];
        setWarehouses(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoadingTables(false);
    }
  }, [fetchTraceMetaForOrder]);

  React.useEffect(() => {
    loadTables();
  }, [loadTables]);

  const pagedSentRows = React.useMemo(() => {
    const start = (sentPage - 1) * PAGE_SIZE;
    return sentRows.slice(start, start + PAGE_SIZE);
  }, [sentRows, sentPage]);

  const pagedIncomingRows = React.useMemo(() => {
    const start = (incomingPage - 1) * PAGE_SIZE;
    return incomingRows.slice(start, start + PAGE_SIZE);
  }, [incomingRows, incomingPage]);

  const availableWarehouses = React.useMemo(() => {
    return warehouses.filter((w) => {
      const max =
        typeof w.maxAssets === "number" && w.maxAssets > 0 ? w.maxAssets : null;
      const count = w.assetCount ?? 0;
      return max === null || count < max;
    });
  }, [warehouses]);

  const defaultWarehouse = React.useMemo(() => {
    if (availableWarehouses.length === 0) return null;
    return availableWarehouses[0];
  }, [availableWarehouses]);

  React.useEffect(() => {
    setSentPage(1);
  }, [sentRows.length]);

  React.useEffect(() => {
    setIncomingPage(1);
  }, [incomingRows.length]);

  React.useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          profile?: { location?: string | null } | null;
        };
        const loc = (data.profile as any)?.location;
        if (typeof loc === "string" && loc.trim()) {
          setProfileLocation(loc.trim());
        }
      } catch {
        // ignore
      }
    };
    loadMe();
  }, []);

  React.useEffect(() => {
    if (!defaultWarehouse) return;
    setReceiveWarehouseIdByOrderId((prev) => {
      const next = { ...prev };
      for (const row of incomingRows) {
        if (row.status !== "SHIPPED") continue;
        if (!next[row.id]) {
          next[row.id] = defaultWarehouse.id;
        }
      }
      return next;
    });
  }, [incomingRows, defaultWarehouse]);

  React.useEffect(() => {
    if (!profileLocation?.trim()) return;
    setReceiveLocationByOrderId((prev) => {
      const next = { ...prev };
      for (const row of incomingRows) {
        if (row.status !== "SHIPPED") continue;
        next[row.id] = profileLocation.trim();
      }
      return next;
    });
  }, [incomingRows, profileLocation]);

  const handleConfirmReceive = async (order: OrderRow) => {
    setError("");
    const warehouseId = (
      receiveWarehouseIdByOrderId[order.id] ||
      defaultWarehouse?.id ||
      ""
    ).trim();
    if (!warehouseId) {
      setError("No available warehouse to receive this order.");
      return;
    }
    const nextLocation = (receiveLocationByOrderId[order.id] || "").trim();
    if (!nextLocation) {
      setError("Select a location before confirming receive.");
      return;
    }
    setConfirmingOrderId(order.id);
    try {
      const walletAddress = await getWalletChangeAddress();

      const latestMeta = await fetchRef100Metadata(
        order.policyId,
        order.assetName,
      );
      if (!latestMeta) {
        throw new Error(
          "Failed to load on-chain datum for reference token (ref100).",
        );
      }

      const ownersRes = await fetch(`${BACKEND_URL}/order/owners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ orderId: order.id }),
      });
      const ownersData = (await ownersRes.json()) as {
        success?: boolean;
        owners?: string[];
        message?: string;
      };
      const owners =
        ownersRes.ok && ownersData?.success && Array.isArray(ownersData.owners)
          ? ownersData.owners
          : [];
      if (owners.length === 0) {
        throw new Error(ownersData?.message || "Owners not found for this order");
      }

      const signer = (walletAddress || "").trim();
      if (signer && !owners.includes(signer)) {
        throw new Error(
          "Your wallet is not in script owners list. Cannot update ref100.",
        );
      }

      const updatedMeta: Record<string, string> = {};
      for (const [k, v] of Object.entries(latestMeta)) {
        updatedMeta[k] = typeof v === "string" ? v : JSON.stringify(v);
      }
      updatedMeta["location"] = nextLocation;

      const unsignedRes = await fetch(`${BACKEND_URL}/contract/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          owners,
          assets: [{ assetName: order.assetName, metadata: updatedMeta }],
        }),
      });
      const unsignedData = await unsignedRes.json();
      if (!unsignedRes.ok || !unsignedData?.result || !unsignedData?.data) {
        throw new Error(
          unsignedData?.message || "Failed to build update transaction",
        );
      }

      const signed = await signTxWithEternl(unsignedData.data);
      const updateTxHash = await submitSignedTxHex(signed);

      await fetch(
        `${BACKEND_URL}/assets/${encodeURIComponent(order.assetUnit)}/location`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            location: nextLocation,
            txHash: updateTxHash,
          }),
        },
      ).catch(() => null);

      const res = await fetch(`${BACKEND_URL}/order/confirm-receive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ orderId: order.id, warehouseId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to confirm receive");
      }
      await loadTables();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to confirm receive",
      );
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handleDeleteOrder = async (order: OrderRow, kind: "sent" | "incoming") => {
    setError("");
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this order?")
    ) {
      return;
    }
    setDeletingOrderId(order.id);
    try {
      const res = await fetch(
        `${BACKEND_URL}/order/${
          kind === "sent" ? "delete-sent" : "delete-incoming"
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ orderId: order.id }),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Failed to delete order");
      }
      if (kind === "sent") {
        setSentRows((prev) => prev.filter((r) => r.id !== order.id));
      } else {
        setIncomingRows((prev) => prev.filter((r) => r.id !== order.id));
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to delete order. Please try again.",
      );
    } finally {
      setDeletingOrderId(null);
    }
  };

  return (
    <div className="w-full space-y-2">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
          {error}
        </p>
      )}

      {tab === "sent" && (
        <div className="w-full space-y-2">
          <div className="overflow-auto">
            <table className="min-w-full text-base">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                    #
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                    Asset
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                    Receiver
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                    Tx
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingTables ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-4 text-center text-gray-500 bg-white"
                    >
                      Loading orders...
                    </td>
                  </tr>
                ) : sentRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-4 text-center text-gray-500 bg-white"
                    >
                      No sent orders.
                    </td>
                  </tr>
                ) : (
                  pagedSentRows.map((row, idx) => (
                    <tr key={row.id} className="border-t border-gray-200">
                      <td className="px-4 py-3 border-r border-gray-200 text-gray-700">
                        {(sentPage - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td
                        className="px-4 py-3 border-r border-gray-200 text-gray-900 max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis"
                        title={row.assetName}
                      >
                        {row.assetName}
                      </td>
                      <td
                        className="px-4 py-3 border-r border-gray-200 font-mono text-gray-700 max-w-[240px] whitespace-nowrap overflow-hidden text-ellipsis"
                        title={row.receiverWalletAddress}
                      >
                        {row.receiverWalletAddress}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200 text-gray-700">
                        {row.status}
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-emerald-700 max-w-[240px] whitespace-nowrap overflow-hidden text-ellipsis"
                        title={row.txHash ?? ""}
                      >
                        {row.txHash || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="flex flex-wrap gap-2 text-sm">
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(row, "sent")}
                            disabled={deletingOrderId === row.id}
                            className="text-sm font-semibold text-gray-600 hover:text-red-700 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {deletingOrderId === row.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            page={sentPage}
            pageSize={PAGE_SIZE}
            total={sentRows.length}
            onPageChange={setSentPage}
          />
        </div>
      )}

      {tab === "incoming" && (
        <div className="w-full space-y-2">
          <div className="overflow-auto">
            <table className="min-w-full text-base">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                    #
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                    Asset
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                    Sender
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingTables ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-4 text-center text-gray-500 bg-white"
                    >
                      Loading orders...
                    </td>
                  </tr>
                ) : incomingRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-4 text-center text-gray-500 bg-white"
                    >
                      No incoming orders.
                    </td>
                  </tr>
                ) : (
                  pagedIncomingRows.map((row, idx) => (
                    <tr key={row.id} className="border-t border-gray-200">
                      <td className="px-4 py-3 border-r border-gray-200 text-gray-700">
                        {(incomingPage - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td
                        className="px-4 py-3 border-r border-gray-200 text-gray-900 max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis"
                        title={row.assetName}
                      >
                        {row.assetName}
                      </td>
                      <td
                        className="px-4 py-3 border-r border-gray-200 font-mono text-gray-700 max-w-[240px] whitespace-nowrap overflow-hidden text-ellipsis"
                        title={row.senderWalletAddress}
                      >
                        {row.senderWalletAddress}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200 text-gray-700">
                        {row.status}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {row.status === "SHIPPED" ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleConfirmReceive(row)}
                              disabled={
                                confirmingOrderId === row.id ||
                                !defaultWarehouse ||
                                !(
                                  (receiveLocationByOrderId[row.id] ?? "").trim()
                                )
                              }
                              className="text-sm font-semibold text-[#c41e3a] hover:text-red-700 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {confirmingOrderId === row.id
                                ? "Confirming..."
                                : "Confirm"}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="text-gray-600">-</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(row, "incoming")}
                              disabled={deletingOrderId === row.id}
                              className="text-sm font-semibold text-gray-600 hover:text-red-700 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {deletingOrderId === row.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            page={incomingPage}
            pageSize={PAGE_SIZE}
            total={incomingRows.length}
            onPageChange={setIncomingPage}
          />
        </div>
      )}
    </div>
  );
}

