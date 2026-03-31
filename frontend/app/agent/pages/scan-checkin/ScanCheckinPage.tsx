"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import * as React from "react";
import Link from "next/link";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

import { captureScannerPhoto } from "@/lib/capture-scanner-photo";
import { shortUnit } from "@/lib/short-unit";
import {
  getCustodianSettlementAddress,
  publishAttestedRecord,
  signOutgoingAttestation,
} from "@/lib/wallet";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
const CARDANO_EXPLORER_TX_PREFIX =
  process.env.NEXT_PUBLIC_CARDANO_EXPLORER_TX_PREFIX ??
  "https://preprod.cexplorer.io/tx/";

function txUrl(hash: string) {
  const h = String(hash || "").trim();
  if (!h) return "";
  return `${String(CARDANO_EXPLORER_TX_PREFIX || "").trim()}${h}`;
}

type LookupProduct = {
  inventoryKey: string;
  lotReference: string;
  custodyParties: string[];
  warehouseId: string | null;
  status: string;
  verified?: boolean;
  hasPending?: boolean;
  imageIpfs?: string | null;
  location: string | null;
};

type WarehouseRow = {
  id: string;
  code: string;
  name: string;
  maxProducts?: number | null;
  productCount?: number;
};

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
  if (!uri) throw new Error("Unable to store your file.");
  return uri;
}

function parseProductUrl(text: string): { inventoryKey: string } | null {
  try {
    let url: URL | null = null;
    if (text.startsWith("http://") || text.startsWith("https://")) {
      url = new URL(text);
    } else if (typeof window !== "undefined") {
      url = new URL(text, window.location.origin);
    }
    if (!url) return null;
    const match = url.pathname.match(/\/product\/(.+)$/);
    if (!match) return null;
    return { inventoryKey: decodeURIComponent(match[1]) };
  } catch {
    return null;
  }
}

function uniqueStrings(arr: string[]) {
  return Array.from(
    new Set(arr.map((x) => (x || "").trim()).filter(Boolean)),
  );
}

export function ScanCheckinPage() {
  const processingRef = React.useRef(false);
  const videoHostRef = React.useRef<HTMLDivElement | null>(null);
  const [result, setResult] = React.useState<string | null>(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const [phase, setPhase] = React.useState<
    "idle" | "working" | "ok" | "err"
  >("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [txHash, setTxHash] = React.useState("");

  const handleScan = async (results: { rawValue?: string }[]) => {
    if (results.length === 0 || processingRef.current) return;

    const text = results[0].rawValue;
    if (!text) return;

    const parsed = parseProductUrl(text);
    if (!parsed) {
      processingRef.current = true;
      setResult(text);
      setIsPaused(true);
      setPhase("err");
      setErrorMessage(
        "Not a valid container QR. Expected a URL ending with /product/…",
      );
      return;
    }

    processingRef.current = true;
    setResult(text);
    setPhase("working");
    setErrorMessage("");
    setSuccessMessage("");
    setTxHash("");

    try {
      const photo = await captureScannerPhoto(videoHostRef.current, "checkin");
      setIsPaused(true);

      const meRes = await fetch(`${BACKEND_URL}/auth/me`, {
        credentials: "include",
      });
      if (!meRes.ok) {
        throw new Error("Session expired. Please sign in again.");
      }
      const me = await meRes.json();
      const profileLocation = (me?.profile?.location || "").trim();
      if (!profileLocation) {
        throw new Error(
          "Set your profile Location before using inbound check-in.",
        );
      }

      const encKey = encodeURIComponent(parsed.inventoryKey);
      const lookupRes = await fetch(
        `${BACKEND_URL}/products/lookup/${encKey}`,
        { credentials: "include", cache: "no-store" },
      );
      if (lookupRes.status === 403) {
        throw new Error(
          "Your signed-in wallet is not on this container’s custody roster.",
        );
      }
      if (lookupRes.status === 404) {
        throw new Error("Container not found.");
      }
      if (!lookupRes.ok) {
        const j = await lookupRes.json().catch(() => ({}));
        throw new Error(
          typeof j?.message === "string"
            ? j.message
            : "Could not load lot details.",
        );
      }

      const product = (await lookupRes.json()) as LookupProduct;
      console.log("[ScanCheckin][agent] lookup product:", {
        inventoryKey: parsed.inventoryKey,
        lotReference: product.lotReference,
        status: product.status,
        custodyParties: product.custodyParties,
      });

      if (product.status === "CONSUMED") {
        throw new Error(
          "This container is consumed / closed; inbound check-in is not allowed.",
        );
      }
      const st = (product.status || "").trim().toUpperCase();
      if (st !== "OUTBOUND_DISPATCH") {
        throw new Error(
          "Inbound QR check-in is only available after the container has been dispatched from warehouse (outbound). Current status does not allow this action.",
        );
      }
      if (product.hasPending || product.verified === false) {
        throw new Error(
          "Public record check is still pending. Please wait for verification before check-in.",
        );
      }

      const checkinImageIpfs = await uploadEvidence(photo);

      const warehousesRes = await fetch(`${BACKEND_URL}/warehouses`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!warehousesRes.ok) {
        throw new Error("Could not load warehouses.");
      }
      const warehouses = (await warehousesRes.json()) as WarehouseRow[];
      if (!Array.isArray(warehouses) || warehouses.length === 0) {
        throw new Error(
          "No warehouses found. Create a warehouse under Warehouses first.",
        );
      }

      const pickFirstAvailable = (): WarehouseRow | null => {
        for (const w of warehouses) {
          const max =
            typeof w.maxProducts === "number" && w.maxProducts > 0
              ? w.maxProducts
              : null;
          const count = w.productCount ?? 0;
          if (max === null || count < max) return w;
        }
        return null;
      };

      let warehouseIdForPatch: string | undefined;
      if (!product.warehouseId) {
        const wh = pickFirstAvailable();
        if (!wh) {
          throw new Error("All warehouses are full; no inbound slot available.");
        }
        warehouseIdForPatch = wh.id;
      }

      const custodianAddress = await getCustodianSettlementAddress();
      const ownerIdentity = custodianAddress.trim();

      const baseOwners = uniqueStrings(product.custodyParties);
      // IMPORTANT: keep roster order stable.
      // The on-chain policyId/token unit depends on the exact owners[] order.
      // Reordering here can make the unit check fail even if the wallet is on the roster.
      const currentOwners = baseOwners.includes(ownerIdentity)
        ? baseOwners
        : uniqueStrings([...baseOwners, ownerIdentity]);
      console.log("[ScanCheckin][agent] signer/auth addresses:", {
        custodianAddress,
        ownerIdentity,
      });
      console.log("[ScanCheckin][agent] owners order used for policyId:", {
        baseOwners,
        currentOwners,
      });

      if (currentOwners.length === 0) {
        throw new Error("Custody roster for this lot is missing.");
      }

      const txRes = await fetch(`${BACKEND_URL}/products/contract/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          custodianAddress,
          owners: currentOwners,
          lotReference: product.lotReference,
          passport: {
            status: "INBOUND_CHECKIN",
            location: profileLocation,
            checkinImage: checkinImageIpfs,
            owners: `[${currentOwners.join(", ")}]`,
            // restore image if previous flows accidentally wiped it
            image: String(product.imageIpfs || "").trim(),
          },
        }),
      });
      const txData = await txRes.json();
      if (!txRes.ok || !txData?.result || !txData?.data) {
        throw new Error(
          txData?.message || txData?.error || "Could not build refresh transaction.",
        );
      }

      const signed = await signOutgoingAttestation(String(txData.data));
      const hash = await publishAttestedRecord(signed);
      setTxHash(hash);

      const patchBody: Record<string, unknown> = {
        confirmationRef: hash,
        custodyParties: currentOwners,
          passport: {
            status: "INBOUND_CHECKIN",
          location: profileLocation,
          checkinImage: checkinImageIpfs,
          owners: `[${currentOwners.join(", ")}]`,
        },
      };
      if (warehouseIdForPatch) {
        patchBody.warehouseId = warehouseIdForPatch;
      }

      const patchRes = await fetch(
        `${BACKEND_URL}/products/${encodeURIComponent(product.inventoryKey)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(patchBody),
        },
      );
      const patchData = await patchRes.json().catch(() => ({}));
      if (!patchRes.ok) {
        throw new Error(
          typeof patchData?.message === "string"
            ? patchData.message
            : "Failed to update the lot record after signing.",
        );
      }

      setSuccessMessage(
        warehouseIdForPatch
          ? `Location updated and container ${shortUnit(product.inventoryKey)} assigned to the first warehouse with capacity.`
          : `Location checkpoint updated for container ${shortUnit(product.inventoryKey)} (already had a warehouse).`,
      );
      setPhase("ok");
    } catch (e) {
      setPhase("err");
      setErrorMessage(
        e instanceof Error ? e.message : "An unexpected error occurred.",
      );
    }
  };

  const handleRestart = () => {
    processingRef.current = false;
    setResult(null);
    setIsPaused(false);
    setPhase("idle");
    setErrorMessage("");
    setSuccessMessage("");
    setTxHash("");
  };

  return (
    <main className="min-h-screen px-3 py-6 sm:px-4 md:py-8">
      <div className="mx-auto w-full max-w-lg space-y-4 md:space-y-5">
    
        <div className="p-0" ref={videoHostRef}>
          <div className="relative aspect-square overflow-hidden rounded-md border border-gray-300 bg-black">
            <Scanner
              onScan={handleScan}
              paused={isPaused}
              constraints={{
                facingMode: "environment",
                width: { ideal: 1280, min: 640 },
                height: { ideal: 720, min: 480 },
              }}
              scanDelay={100}
              formats={["qr_code"]}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { objectFit: "cover", width: "100%", height: "100%" },
              }}
              components={{
                torch: true,
                zoom: true,
                finder: true,
              }}
              allowMultiple={false}
            />

            {!isPaused && !result && (
              <>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-48 w-48 rounded-2xl border-4 border-dashed border-[#c41e3a]/45 md:h-56 md:w-56" />
                </div>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-48 w-48 overflow-hidden rounded-2xl border border-transparent md:h-56 md:w-56">
                    <div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent md:h-1"
                      style={{ animation: "scanLine 2s linear infinite" }}
                    />
                  </div>
                </div>
              </>
            )}

            {result && (
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-md bg-black/80">
                <div className="mx-auto w-full max-w-xs space-y-3 px-4 py-6 text-center">
                  {phase === "working" ? (
                    <>
                      <Loader2 className="mx-auto h-14 w-14 animate-spin text-white" />
                      <p className="text-lg font-bold text-white">
                        Processing check-in…
                      </p>
                      <p className="text-sm text-white/80">
                        Verifying custody, signing, updating location and warehouse.
                      </p>
                    </>
                  ) : phase === "ok" ? (
                    <>
                      <CheckCircle className="mx-auto h-14 w-14 text-green-500" />
                      <p className="text-lg font-bold text-white">Success</p>
                      <p className="text-sm text-white/90">{successMessage}</p>
                      {txHash ? (
                        <a
                          href={txUrl(txHash)}
                          target="_blank"
                          rel="noreferrer"
                          className="block break-all text-xs text-emerald-300 underline underline-offset-4"
                        >
                          Open receipt
                        </a>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleRestart}
                        className="inline-flex items-center justify-center rounded-md bg-[#c41e3a] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                      >
                        Scan another
                      </button>
                    </>
                  ) : (
                    <>
                      <XCircle className="mx-auto h-14 w-14 text-red-500" />
                      <p className="text-lg font-bold text-white">
                        Could not complete
                      </p>
                      <p className="text-sm text-white/90">{errorMessage}</p>
                      <button
                        type="button"
                        onClick={handleRestart}
                        className="inline-flex items-center justify-center rounded-md bg-[#c41e3a] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                      >
                        Try again
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes scanLine {
          0% {
            top: 16%;
          }
          50% {
            top: 74%;
          }
          100% {
            top: 16%;
          }
        }
      `}</style>
    </main>
  );
}
