"use client";

import * as React from "react";
import {
  getWalletChangeAddress,
  signTxWithEternl,
  submitSignedTxHex,
} from "@/lib/wallet";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export type AssetFormMode = "mint" | "update" | "burn";

export type InitialAssetData = Partial<{
  assetName: string;
  owners: string[];
  name: string;
  description: string;
  brand: string | null;
  model: string | null;
  material: string | null;
  notes: string | null;
  battery: string | null;
  image: string | null;
  mediaType: string | null;
  roadmap: string | null;
  location: string | null;
}>;

export function AssetForm({
  mode,
  initialAssetName,
  initialAsset,
  readOnly,
  onSuccess,
}: {
  mode: AssetFormMode;
  initialAssetName?: string;
  initialAsset?: InitialAssetData | null;
  readOnly?: boolean;
  onSuccess?: (params: {
    action: AssetFormMode;
    txHash: string;
    unit: string;
    owners: string[];
  }) => void;
}) {
  const [owners, setOwners] = React.useState<string[]>(() => {
    if (initialAsset?.owners && initialAsset.owners.length > 0) {
      return initialAsset.owners;
    }
    return [];
  });
  const [ownerInput, setOwnerInput] = React.useState("");
  const [roadmapStops, setRoadmapStops] = React.useState<string[]>([]);
  const [ownerLocationByWallet, setOwnerLocationByWallet] = React.useState<Record<string, string>>({});
  const [warehouses, setWarehouses] = React.useState<
    {
      id: string;
      code: string;
      name: string;
      maxAssets?: number | null;
      assetCount?: number;
    }[]
  >([]);
  const [warehouseId, setWarehouseId] = React.useState<string>("");
  const [myWalletAddress, setMyWalletAddress] = React.useState<string>("");
  const [identityAddress, setIdentityAddress] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [txHash, setTxHash] = React.useState("");
  const [assetName, setAssetName] = React.useState(
    initialAssetName ?? "Organic Mango Batch 01",
  );
  const [metaName, setMetaName] = React.useState(
    "Organic Mango — Premium Grade (Batch 01)",
  );
  const [description, setDescription] = React.useState(
    "Fresh organic mangoes grown under sustainable farming practices. This batch is tracked end-to-end from farm to warehouse, to delivery, and final sale.",
  );
  const [brand, setBrand] = React.useState("HSUPPLY Farm");
  const [model, setModel] = React.useState("Mango (Cat Chu)");
  const [material, setMaterial] = React.useState("Natural product");
  const [notes, setNotes] = React.useState("Optional notes for batch or quality.");
  const [battery, setBattery] = React.useState("");
  const [image, setImage] = React.useState(
    "ipfs://QmYourIPFSHashmangobatch01png",
  );
  const [mediaType, setMediaType] = React.useState("image/png");
  const [assetImages, setAssetImages] = React.useState<
    { id: string; name: string; mimeType: string; url: string }[]
  >([]);
  const [producers, setProducers] = React.useState<
    { id: string; name: string; code?: string | null }[]
  >([]);
  const [productTypes, setProductTypes] = React.useState<
    { id: string; name: string; code?: string | null }[]
  >([]);
  const [certifications, setCertifications] = React.useState<
    { id: string; name: string; certCode?: string | null }[]
  >([]);
  const [selectedCertificationId, setSelectedCertificationId] =
    React.useState<string>("");
  const [location, setLocation] = React.useState("Ha Noi");

  React.useEffect(() => {
    const loadLookups = async () => {
      try {
        if (typeof document === "undefined") return;
        const cookie = document.cookie
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("auth_token="));
        const token = cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
        if (!token) return;
        const [imgRes, prodRes, typeRes, certRes] = await Promise.all([
          fetch(`${BACKEND_URL}/asset-images`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BACKEND_URL}/producers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BACKEND_URL}/product-types`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BACKEND_URL}/certifications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (imgRes.ok) {
          const data = (await imgRes.json()) as {
            id: string;
            ownerWalletAddress: string;
            name: string;
            mimeType: string;
            ipfsHash: string;
            url: string;
          }[];
          if (Array.isArray(data)) {
            setAssetImages(
              data.map((img) => ({
                id: img.id,
                name: img.name,
                mimeType: img.mimeType,
                url: img.url,
              })),
            );
          }
        }
        if (prodRes.ok) {
          const data = (await prodRes.json()) as {
            id: string;
            name: string;
            code?: string | null;
          }[];
          if (Array.isArray(data)) {
            setProducers(data);
          }
        }
        if (typeRes.ok) {
          const data = (await typeRes.json()) as {
            id: string;
            name: string;
            code?: string | null;
          }[];
          if (Array.isArray(data)) {
            setProductTypes(data);
          }
        }
        if (certRes.ok) {
          const data = (await certRes.json()) as {
            id: string;
            name: string;
            certCode?: string | null;
          }[];
          if (Array.isArray(data)) {
            setCertifications(data);
          }
        }
      } catch {
        // ignore
      }
    };
    loadLookups();
  }, []);

  React.useEffect(() => {
    const stops = roadmapStops.map((s) => s.trim()).filter(Boolean);
    if (stops.length === 0) {
      setLocation("");
    } else if (!stops.includes(location)) {
      setLocation(stops[0]);
    }
  }, [roadmapStops]);

  const trimmedOwners = React.useMemo(() => {
    const creator = (identityAddress || "").trim();
    const base = owners.map((s) => s.trim()).filter(Boolean);
    if (mode === "mint" && creator) {
      const withoutCreator = base.filter((v) => v !== creator);
      return [creator, ...withoutCreator];
    }
    return base;
  }, [owners, identityAddress, mode]);

  const fetchOwnerLocation = React.useCallback(async (walletAddress: string) => {
    const addr = walletAddress.trim();
    if (!addr) return "";
    try {
      const res = await fetch(
        `${BACKEND_URL}/profile/public/${encodeURIComponent(addr)}`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as { profile?: { location?: string | null } | null };
      const loc = (data?.profile?.location || "").trim();
      return loc;
    } catch {
      return "";
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const wanted = trimmedOwners;
      if (wanted.length === 0) {
        setRoadmapStops([]);
        return;
      }

      const missing = wanted.filter((addr) => !(addr in ownerLocationByWallet));
      let combined: Record<string, string> = ownerLocationByWallet;
      if (missing.length > 0) {
        const pairs = await Promise.all(
          missing.map(async (addr) => [addr, await fetchOwnerLocation(addr)] as const),
        );
        if (cancelled) return;
        combined = {
          ...ownerLocationByWallet,
          ...Object.fromEntries(pairs),
        };
        setOwnerLocationByWallet((prev) => {
          const next = { ...prev };
          for (const [addr, loc] of pairs) next[addr] = loc;
          return next;
        });
      }

      const seen = new Set<string>();
      const nextStops: string[] = [];
      for (const addr of wanted) {
        const loc = (combined[addr] || "").trim();
        if (!loc) continue;
        if (seen.has(loc)) continue;
        seen.add(loc);
        nextStops.push(loc);
      }
      setRoadmapStops(nextStops);
    };

    sync();
    return () => {
      cancelled = true;
    };
  }, [trimmedOwners, ownerLocationByWallet, fetchOwnerLocation]);

  const trimmedRoadmapStops = React.useMemo(
    () => roadmapStops.map((s) => s.trim()).filter(Boolean),
    [roadmapStops],
  );

  const roadmapString = React.useMemo(
    () =>
      trimmedRoadmapStops.length > 0
        ? `[${trimmedRoadmapStops.join(", ")}]`
        : "",
    [trimmedRoadmapStops],
  );

  const minExpiryDateTime = React.useMemo(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }, []);

  React.useEffect(() => {
    const loadWarehouses = async () => {
      try {
        if (typeof document === "undefined") return;
        const cookie = document.cookie
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("auth_token="));
        const token = cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/warehouses`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          id: string;
          code: string;
          name: string;
          maxAssets?: number | null;
          assetCount?: number;
        }[];
        if (Array.isArray(data)) {
          setWarehouses(data);
        }
      } catch {
      }
    };
    loadWarehouses();
  }, []);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (identityAddress) return;
    const cookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("auth_token="));
    const token = cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
    if (!token) return;
    const parts = token.split(".");
    if (parts.length < 2) return;
    try {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "=",
      );
      const json = atob(padded);
      const payload = JSON.parse(json) as {
        paymentAddress?: unknown;
        walletAddress?: unknown;
        sub?: unknown;
      };
      const addr =
        (typeof payload.paymentAddress === "string" && payload.paymentAddress) ||
        (typeof payload.walletAddress === "string" && payload.walletAddress) ||
        (typeof payload.sub === "string" && payload.sub) ||
        "";
      if (addr) setIdentityAddress(addr);
    } catch {}
  }, [identityAddress]);

  React.useEffect(() => {
    if (mode !== "mint") return;
    const creator = (identityAddress || "").trim();
    if (!creator) return;
    setOwners((prev) => (prev.includes(creator) ? prev : [creator, ...prev]));
  }, [identityAddress, mode]);

  const formatOwner = React.useCallback((addr: string) => {
    if (addr.length <= 24) return addr;
    return `${addr.slice(0, 12)}...${addr.slice(-6)}`;
  }, []);

  const handleAddOwner = React.useCallback(() => {
    const value = ownerInput.trim();
    if (!value) return;
    setOwners((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setOwnerInput("");
  }, [ownerInput, identityAddress]);

  const handleRemoveOwner = React.useCallback((addr: string) => {
    const creator = (identityAddress || "").trim();
    if (mode === "mint" && creator && addr === creator) return;
    setOwners((prev) => prev.filter((v) => v !== addr));
  }, [identityAddress, mode]);

  const handleClearOwners = React.useCallback(() => {
    const creator = (identityAddress || "").trim();
    if (mode === "mint" && creator) {
      setOwners([creator]);
      return;
    }
    setOwners([]);
  }, [identityAddress, mode]);

  const handleMoveOwner = React.useCallback((index: number, offset: number) => {
    setOwners((prev) => {
      const next = [...prev];
      const targetIndex = index + offset;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const creator = (identityAddress || "").trim();
      if (mode === "mint" && creator) {
        if (next[index] === creator) return prev;
        if (next[targetIndex] === creator) return prev;
      }
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  }, [identityAddress, mode]);

  React.useEffect(() => {
    if (initialAssetName) {
      setAssetName(initialAssetName);
    }
  }, [initialAssetName]);

  React.useEffect(() => {
    if (!initialAsset) return;

    if (Array.isArray(initialAsset.owners) && initialAsset.owners.length > 0) {
      setOwners(initialAsset.owners);
    }
    if (typeof initialAsset.assetName === "string" && initialAsset.assetName.trim()) {
      setAssetName(initialAsset.assetName);
    }
    if (typeof initialAsset.name === "string") setMetaName(initialAsset.name);
    if (typeof initialAsset.description === "string") setDescription(initialAsset.description);
    if (typeof initialAsset.brand === "string") setBrand(initialAsset.brand);
    if (typeof initialAsset.model === "string") setModel(initialAsset.model);
    if (typeof initialAsset.material === "string") setMaterial(initialAsset.material);
    if (typeof initialAsset.notes === "string") setNotes(initialAsset.notes);
    if (typeof initialAsset.battery === "string") {
      const v = initialAsset.battery.trim();
      const isDateTimeLocal = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v);
      setBattery(isDateTimeLocal ? v : "");
    }
    if (typeof initialAsset.image === "string") setImage(initialAsset.image);
    if (typeof initialAsset.mediaType === "string") setMediaType(initialAsset.mediaType);
    if (typeof initialAsset.location === "string") setLocation(initialAsset.location);
  }, [initialAsset]);

  const disabled = loading || !!readOnly;
  const mintDisabled = disabled || (mode === "mint" && !warehouseId.trim());
  const lockImmutable = readOnly || mode !== "mint";
  const ownersLocked = lockImmutable;

  const runAction = async () => {
    if (readOnly) {
      return;
    }
    const action = mode;
    setError("");
    setTxHash("");
    setLoading(true);
    try {
      if (!assetName.trim()) {
        throw new Error("Asset name is required.");
      }
      if (action !== "burn" && (!metaName.trim() || !description.trim())) {
        throw new Error("Name and description are required for mint/update.");
      }
      if (action === "mint" && (!warehouseId || !warehouseId.trim())) {
        throw new Error("Warehouse is required.");
      }

      if (typeof window === "undefined") {
        throw new Error("Browser environment required");
      }

      const walletAddress = await getWalletChangeAddress();
      setMyWalletAddress(walletAddress);

      const ownerIdentity = identityAddress || walletAddress;

      const cookie = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("auth_token="));
      const token = cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
      if (!token) {
        throw new Error("Unauthorized. Please sign in again.");
      }

      const baseOwners = Array.from(new Set(trimmedOwners));
      const currentOwners =
        action === "mint"
          ? Array.from(new Set([...baseOwners, ownerIdentity]))
          : baseOwners;
      if (currentOwners.length === 0) {
        throw new Error("At least one owner address is required.");
      }

      const metadata = {
        name: metaName.trim(),
        description: description.trim(),
        brand: brand.trim(),
        model: model.trim(),
        material: material.trim(),
        notes: notes.trim(),
        battery: battery.trim(),
        image: image.trim(),
        mediaType: mediaType.trim(),
        roadmap: roadmapString,
        location: location.trim(),
        owners: `[${currentOwners.join(", ")}]`,
      };

      let endpoint: string;
      let body: Record<string, any>;

      if (action === "mint") {
        endpoint = `${BACKEND_URL}/contract/mint`;
        body = {
          walletAddress,
          owners: currentOwners,
          assets: [{ assetName, metadata, quantity: "1" }],
        };
      } else if (action === "update") {
        endpoint = `${BACKEND_URL}/contract/update`;
        body = {
          walletAddress,
          owners: currentOwners,
          assets: [{ assetName, metadata }],
        };
      } else {
        endpoint = `${BACKEND_URL}/contract/burn`;
        body = {
          walletAddress,
          owners: currentOwners,
          assets: [{ assetName }],
        };
      }

      console.log(`[AssetForm] Calling backend: ${endpoint}`);
      console.log(`[AssetForm] Request body:`, body);

      const txRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const txData = await txRes.json();

      console.log(`[AssetForm] Backend response:`, txData);

      if (!txData.result || !txData.data) {
        throw new Error(txData.message || "Failed to build transaction");
      }

      const unsigned = txData.data;
      console.log(`[AssetForm] Got unsigned tx, signing...`);
      const signed = await signTxWithEternl(unsigned);

      console.log(`[AssetForm] Submitting signed tx via wallet...`);
      const hash = await submitSignedTxHex(signed);
      setTxHash(hash);

      const infoRes = await fetch(
        `${BACKEND_URL}/contract/info?owners=${currentOwners.join(",")}`,
      );
      const infoData = await infoRes.json();
      const policyId = infoData.policyId || "";
      const unit =
        policyId + Buffer.from(assetName, "utf8").toString("hex");

      if (action === "mint") {
        try {
          await fetch(`${BACKEND_URL}/assets`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              policyId,
              assetName,
              unit,
              txHash: hash,
              owners: currentOwners,
              warehouseId: warehouseId || undefined,
              metadata,
            }),
          });
        } catch (e) {
          console.error("Failed to persist asset:", e);
        }
      } else if (action === "update") {
        try {
          await fetch(`${BACKEND_URL}/assets/${unit}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              txHash: hash,
              owners: currentOwners,
              metadata,
            }),
          });
        } catch (e) {
          console.error("Failed to update asset:", e);
        }
      } else if (action === "burn") {
        try {
          await fetch(`${BACKEND_URL}/assets/${unit}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (e) {
          console.error("Failed to delete asset:", e);
        }
      }

      if (onSuccess) {
        onSuccess({ action, txHash: hash, unit, owners: currentOwners });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const title = readOnly
    ? "Asset detail"
    : mode === "mint"
    ? "Mint asset"
    : mode === "update"
    ? "Update asset"
    : "Burn asset";

  const buttonLabel = loading
    ? mode === "mint"
      ? "Minting..."
      : mode === "update"
      ? "Updating..."
      : "Burning..."
    : mode === "mint"
    ? "Mint"
    : mode === "update"
    ? "Update"
    : "Burn";

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          {title}
        </h1>
        <p className="text-base text-gray-600 mt-1">
          Use your browser wallet to {mode} the agricultural product NFT.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Owners
        </label>
        {!ownersLocked && (
          <div className="flex gap-2">
            <input
              type="text"
              value={ownerInput}
              onChange={(e) => setOwnerInput(e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] bg-white disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="addr_test1q..."
            />
            <button
              type="button"
              disabled={disabled}
              onClick={handleAddOwner}
              className="px-4 py-3 text-base font-semibold rounded-md border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        )}
        <p className="text-sm text-gray-500">
          Enter owner addresses manually. Your wallet will be added automatically on mint.
        </p>
        {trimmedOwners.length > 0 && (
          <div className="mt-2 space-y-2">
            {trimmedOwners.map((addr, ownerIndex) => {
              const creator = (identityAddress || myWalletAddress || "").trim();
              const isCreator = !!creator && addr === creator;

              return (
              <div
                key={addr}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-gray-100 text-base text-gray-700 w-full justify-between"
              >
                <span className="truncate mr-2">
                  <span className="font-semibold text-gray-500 mr-2">
                    {ownerIndex + 1}.
                  </span>
                  {formatOwner(addr)}
                  {isCreator && (
                    <span className="ml-2 text-xs font-semibold text-[#c41e3a] bg-white border border-gray-200 rounded px-2 py-0.5">
                      Creator
                    </span>
                  )}
                </span>
                {!ownersLocked && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleMoveOwner(ownerIndex, -1)}
                      className="text-gray-500 hover:text-gray-800"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleMoveOwner(ownerIndex, 1)}
                      className="text-gray-500 hover:text-gray-800"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleRemoveOwner(addr)}
                      className="text-gray-500 hover:text-gray-800"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              );
            })}
            {!ownersLocked && (
              <button
                type="button"
                disabled={disabled}
                onClick={handleClearOwners}
                className="text-sm text-[#c41e3a] hover:text-red-700"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-gray-100 pt-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Asset & metadata
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mode === "mint" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Warehouse <span className="text-red-600">*</span>
              </label>
              <select
                disabled={disabled}
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                required
                className="w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] bg-white disabled:bg-gray-50 disabled:text-gray-400"
              >
              <option value="">Select a warehouse…</option>
              {warehouses.map((w) => {
                const max =
                  typeof w.maxAssets === "number" && w.maxAssets > 0
                    ? w.maxAssets
                    : null;
                const count = w.assetCount ?? 0;
                const isFull = max !== null && count >= max;
                return (
                  <option key={w.id} value={w.id} disabled={isFull}>
                    {w.code} — {w.name}
                    {isFull ? " (Full)" : ""}
                  </option>
                );
              })}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Asset name
            </label>
            <input
              disabled={disabled || lockImmutable}
              type="text"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className={`w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] ${
                lockImmutable ? "bg-gray-50 text-gray-400" : ""
              }`}
            />
          </div>
          {mode !== "burn" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Producer
                </label>
                <select
                  disabled={disabled || producers.length === 0}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    {producers.length === 0
                      ? "No producers in library"
                      : "Select a producer…"}
                  </option>
                  {producers.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                      {p.code ? ` (${p.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Product type
                </label>
                <select
                  disabled={disabled || productTypes.length === 0}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    {productTypes.length === 0
                      ? "No product types in library"
                      : "Select a product type…"}
                  </option>
                  {productTypes.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                      {t.code ? ` (${t.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Certification
                </label>
                <select
                  disabled={disabled || certifications.length === 0}
                  value={selectedCertificationId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedCertificationId(id);
                    const found = certifications.find((c) => c.id === id);
                    if (found) {
                      setMaterial(
                        found.certCode
                          ? `${found.name} (${found.certCode})`
                          : found.name,
                      );
                    } else {
                      setMaterial("Natural product");
                    }
                  }}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    {certifications.length === 0
                      ? "No certifications in library"
                      : "Select a certification…"}
                  </option>
                  {certifications.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.certCode ? ` (${c.certCode})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Batch / Expiry
                </label>
                <input
                  disabled={disabled}
                  type="datetime-local"
                  value={battery}
                  min={minExpiryDateTime}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v && v < minExpiryDateTime) {
                      setBattery(minExpiryDateTime);
                    } else {
                      setBattery(v);
                    }
                  }}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Location
                </label>
                <select
                  disabled={disabled}
                  value={trimmedRoadmapStops.includes(location) ? location : (trimmedRoadmapStops[0] ?? "")}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  {trimmedRoadmapStops.length === 0 ? (
                    <option value="">Add at least one roadmap stop</option>
                  ) : (
                    trimmedRoadmapStops.map((stop) => (
                      <option key={stop} value={stop}>
                        {stop}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  From Roadmap stops
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  disabled={disabled}
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
                  placeholder="Optional"
                />
              </div>
            </>
          )}
        </div>
        {mode !== "burn" && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Product name (metadata)
              </label>
              <input
                disabled={disabled || lockImmutable}
                type="text"
                value={metaName}
                onChange={(e) => setMetaName(e.target.value)}
              className={`w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] ${
                lockImmutable ? "bg-gray-50 text-gray-400" : ""
              }`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                disabled={disabled}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[80px] px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Image
                </label>
              <select
                disabled={disabled || assetImages.length === 0}
                value={image}
                onChange={(e) => {
                  const url = e.target.value;
                  setImage(url);
                  const found = assetImages.find((img) => img.url === url);
                  if (found) {
                    setMediaType(found.mimeType || "image/*");
                  }
                }}
                className="w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] bg-white disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  {assetImages.length === 0
                    ? "No images in library"
                    : "Select an image…"}
                </option>
                {assetImages.map((img) => (
                  <option key={img.id} value={img.url}>
                    {img.name} — {img.mimeType}
                  </option>
                ))}
              </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Media type
                </label>
                <input
                  disabled
                  type="text"
                  value={mediaType}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Roadmap (auto)
              </label>
              {trimmedRoadmapStops.length > 0 && (
                <div className="mt-2 space-y-2">
                  {trimmedRoadmapStops.map((stop, index) => (
                    <div
                      key={stop}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-gray-100 text-base text-gray-700 w-full justify-between"
                    >
                      <span className="truncate mr-2">
                        <span className="font-semibold text-gray-500 mr-2">
                          {index + 1}.
                        </span>
                        {stop}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {trimmedRoadmapStops.length === 0 && (
                <p className="text-sm text-gray-500">
                  Roadmap is generated from owner profile locations.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
          {error}
        </p>
      )}

      {txHash && (
        <p className="text-sm text-emerald-700 break-all">
          Tx hash: {txHash}
        </p>
      )}

      {!readOnly && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runAction}
            disabled={mintDisabled}
            className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-[#c41e3a] text-white text-base font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {buttonLabel}
          </button>
        </div>
      )}
    </div>
  );
}