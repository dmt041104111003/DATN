"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import * as React from "react";
import Link from "next/link";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

import { AGENT_ROUTES } from "@/app/agent/constants/routes";
import { captureScannerPhoto } from "@/lib/capture-scanner-photo";
import { shortUnit } from "@/lib/short-unit";
import {
  getCustodianSettlementAddress,
  publishAttestedRecord,
  signOutgoingAttestation,
} from "@/lib/wallet";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
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
  name?: string | null;
  description?: string | null;
  brand?: string | null;
  model?: string | null;
  material?: string | null;
  notes?: string | null;
  battery?: string | null;
  image?: string | null;
  mediaType?: string | null;
  roadmap?: string | null;
  location?: string | null;
  quantity?: string | null;
  quantityUnit?: string | null;
};

function normLoc(v: unknown): string {
  return String(v ?? "").trim().toLowerCase();
}

function parseRoadmapLocations(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean);
  const s = String(raw ?? "").trim();
  if (!s) return [];
  try {
    const j = JSON.parse(s);
    if (Array.isArray(j)) return j.map((x) => String(x).trim()).filter(Boolean);
  } catch {
    // ignore
  }
  return s
    .split(/\n+/)
    .map((x) => x.trim())
    .filter(Boolean);
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
  if (!uri) throw new Error("Unable to store your file.");
  return uri;
}

function parseInventoryKey(text: string): { inventoryKey: string } | null {
  const raw = (text || "").trim();
  if (!raw) return null;

  try {
    const maybeJson = JSON.parse(raw);
    if (maybeJson && typeof maybeJson === "object") {
      const inv = (maybeJson as any).inventoryKey;
      if (typeof inv === "string" && inv.trim()) return { inventoryKey: inv.trim() };
    }
  } catch {
    // ignore
  }

  try {
    let url: URL | null = null;
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      url = new URL(raw);
    } else if (typeof window !== "undefined") {
      url = new URL(raw, window.location.origin);
    }
    if (url) {
      const match = url.pathname.match(/\/product\/(.+)$/);
      if (match) return { inventoryKey: decodeURIComponent(match[1]) };
    }
  } catch {
    // ignore
  }

  return { inventoryKey: raw };
}

export function ScanConsumePage() {
  const processingRef = React.useRef(false);
  const videoHostRef = React.useRef<HTMLDivElement | null>(null);
  const [result, setResult] = React.useState<string | null>(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const [phase, setPhase] = React.useState<"idle" | "working" | "ok" | "err">("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [confirmationRef, setConfirmationRef] = React.useState("");

  const handleRestart = React.useCallback(() => {
    processingRef.current = false;
    setIsPaused(false);
    setResult(null);
    setPhase("idle");
    setErrorMessage("");
    setSuccessMessage("");
    setConfirmationRef("");
  }, []);

  const handleScan = async (results: { rawValue?: string }[]) => {
    if (results.length === 0 || processingRef.current) return;
    const text = results[0]?.rawValue;
    if (!text) return;

    const parsed = parseInventoryKey(text);
    if (!parsed) return;

    processingRef.current = true;
    setResult(text);
    setPhase("working");
    setErrorMessage("");
    setSuccessMessage("");
    setConfirmationRef("");

    try {
      const photo = await captureScannerPhoto(videoHostRef.current, "consume");
      setIsPaused(true);

      // 1) Check owner via lookup (backend enforces custody roster)
      const encKey = encodeURIComponent(parsed.inventoryKey);
      const lookupRes = await fetch(`${BACKEND_URL}/products/lookup/${encKey}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (lookupRes.status === 403) {
        throw new Error("Your signed-in wallet is not on this container’s custody roster.");
      }
      if (lookupRes.status === 404) {
        throw new Error("Container not found.");
      }
      if (!lookupRes.ok) {
        const j = await lookupRes.json().catch(() => ({}));
        throw new Error(typeof j?.message === "string" ? j.message : "Could not load lot details.");
      }
      const product = (await lookupRes.json()) as LookupProduct;

      const st = (product.status || "").trim().toUpperCase();
      if (st === "CONSUMED") {
        throw new Error("This container is already consumed / closed.");
      }
      if (st === "OUTBOUND_DISPATCH") {
        throw new Error("This container is outbound dispatched. Consumption is not allowed.");
      }
      if (product.hasPending || product.verified === false) {
        throw new Error("Public record check is still pending. Please wait for verification before consuming.");
      }
      if (!product.warehouseId) {
        throw new Error("This container is not staged in any warehouse.");
      }
      const signer = (await getCustodianSettlementAddress()).trim();
      const parties = Array.isArray(product.custodyParties) ? product.custodyParties : [];
      const lastParty = (parties[parties.length - 1] || "").trim();
      if (!lastParty) {
        throw new Error("Custody roster is missing for this container.");
      }
      if (lastParty !== signer) {
        throw new Error("Only the last custody address may consume this container.");
      }

      const roadmapLocs = parseRoadmapLocations(product.roadmap);
      const finalLoc = roadmapLocs.length ? roadmapLocs[roadmapLocs.length - 1] : "";
      if (finalLoc) {
        const currentLoc = String(product.location ?? "").trim();
        if (!currentLoc) {
          throw new Error("Missing current location; cannot consume.");
        }
        if (normLoc(currentLoc) !== normLoc(finalLoc)) {
          throw new Error(
            `Consumption is only allowed at the final checkpoint (${finalLoc}). Current: ${currentLoc}.`,
          );
        }
      }

      // 2) Ensure this lot is in one of *your* warehouses (site-level access)
      const warehousesRes = await fetch(`${BACKEND_URL}/warehouses`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!warehousesRes.ok) {
        throw new Error("Could not load warehouses for this account.");
      }
      const warehouses = (await warehousesRes.json()) as Array<{ id: string }>;
      const allowedWarehouseIds = new Set(
        (Array.isArray(warehouses) ? warehouses : [])
          .map((w) => String((w as any)?.id || "").trim())
          .filter(Boolean),
      );
      if (!allowedWarehouseIds.has(product.warehouseId)) {
        throw new Error("This container is not staged in a warehouse owned by this account.");
      }

      const consumeImageIpfs = await uploadEvidence(photo);

      // 3) Prepare "consume" blockchain attestation WITHOUT burning token22:
      // publish a custody record update (refresh-lot) and update DB status to CONSUMED with the tx hash.
      const custodianAddress = signer;
      const currentOwners = (Array.isArray(product.custodyParties)
        ? product.custodyParties
        : []
      ).map((x) => String(x).trim()).filter(Boolean);

      if (currentOwners.length === 0) {
        throw new Error("Custody roster is missing for this container.");
      }

      const baseNotes = String(product.notes ?? "").trim();
      const locationForRecord = String(product.location ?? "").trim() || "Consumed";

      const txRes = await fetch(`${BACKEND_URL}/products/contract/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          custodianAddress,
          owners: currentOwners,
          lotReference: product.lotReference,
          passport: {
            status: "CONSUMED",
            location: locationForRecord,
            consumeImage: consumeImageIpfs,
            owners: `[${currentOwners.join(", ")}]`,
            // restore image if previous flows accidentally wiped it
            image: String(product.imageIpfs || "").trim(),
          },
        }),
      });
      const txData = await txRes.json();
      if (!txRes.ok || !txData?.result || !txData?.data) {
        throw new Error(
          txData?.message || txData?.error || "Could not build consume refresh transaction.",
        );
      }

      const signed = await signOutgoingAttestation(String(txData.data));
      const txHash = await publishAttestedRecord(signed);

      // 5) Persist CONSUMED in DB; this also prevents dispatch in warehouse UI
      const clearRes = await fetch(`${BACKEND_URL}/products/clear-warehouse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          inventoryKey: parsed.inventoryKey,
          status: "CONSUMED",
          confirmationRef: txHash,
          consumeImage: consumeImageIpfs,
        }),
      });
      const clearData = await clearRes.json().catch(() => null);
      if (!clearRes.ok) {
        throw new Error(
          clearData?.message || clearData?.error || "Consume was published but DB update failed.",
        );
      }

      setConfirmationRef(txHash);
      setSuccessMessage(`Container ${shortUnit(product.inventoryKey)} marked as CONSUMED.`);
      setPhase("ok");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
      setPhase("err");
    }
  };

  return (
    <main className="min-h-screen px-3 py-6 sm:px-4 md:py-8">
      <div className="mx-auto w-full max-w-lg space-y-4 md:space-y-5">
   

        <div
          ref={videoHostRef}
          className="relative aspect-square overflow-hidden rounded-md border border-gray-300 bg-black"
        >
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
                      Processing consumption…
                    </p>
                    <p className="text-sm text-white/80">
                      Verifying custody, signing, publishing, updating status.
                    </p>
                  </>
                ) : phase === "ok" ? (
                  <>
                    <CheckCircle className="mx-auto h-14 w-14 text-green-500" />
                    <p className="text-lg font-bold text-white">Success</p>
                    <p className="text-sm text-white/90">{successMessage}</p>
                    {confirmationRef ? (
                      <a
                        href={txUrl(confirmationRef)}
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
                      Scan again
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

