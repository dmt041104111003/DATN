/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Head from "next/head";
import {
  Check,
  MapPin,
  Truck,
  Factory,
  Ship,
  Calendar,
  BadgeCheck,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getTracking } from "@/actions/tracking";

export default function ProductTraceabilityPage() {
  const params = useParams();
  const unit = params.id as string;

  const { data: tracking, isLoading, isError, error } = useQuery({
    queryKey: ["product-tracking", unit],
    queryFn: () => getTracking({ unit }),
    enabled: !!unit,
  });

  const [selectedStep, setSelectedStep] = React.useState(0);

  const normalize = (s: string) => s?.toLowerCase().trim() || "";

  const waypoints = React.useMemo(() => {
    const roadmapStr = tracking?.metadata?.roadmap || "";
    const list = roadmapStr
      .replace(/[\[\]]/g, "")
      .split(",")
      .map((w: string) => w.trim())
      .filter(Boolean);
    return list.length
      ? list
      : ["Origin", "Manufacturing", "Transportation", "Distribution", "Delivery"];
  }, [tracking]);

  const transactionLocations = React.useMemo(
    () => tracking?.transaction_history.map((t: any) => t.metadata?.location).filter(Boolean) || [],
    [tracking]
  );

  const currentLocation = tracking?.metadata?.location || waypoints[0];
  const currentIndex = waypoints.findIndex((loc: any) => normalize(loc) === normalize(currentLocation));

  React.useEffect(() => {
    if (currentIndex >= 0) setSelectedStep(currentIndex);
  }, [currentIndex]);

  const selectedTx = tracking?.transaction_history.find(
    (tx: any) => normalize(tx.metadata?.location) === normalize(waypoints[selectedStep])
  );

  const iconForLocation = (loc: string) => {
    const lower = loc.toLowerCase();
    if (lower.includes("ha noi") || lower.includes("hanoi")) return <Factory className="w-6 h-6" />;
    if (lower.includes("hung yen")) return <Truck className="w-6 h-6" />;
    if (lower.includes("hai phong")) return <Ship className="w-6 h-6" />;
    return <Package className="w-6 h-6" />;
  };

  const productMeta = tracking?.metadata;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 font-medium">Loading traceability journey...</p>
        </div>
      </div>
    );
  }

  if (isError || !tracking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-6">
        <div className="bg-white/90 backdrop-blur-xl border border-red-100/50 rounded-3xl p-12 shadow-2xl text-center max-w-lg w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Traceability Data Unavailable</h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            We couldn't retrieve the traceability information for this product. This may be due to a network issue, an invalid product ID, or the data not being recorded on the blockchain yet. Please try again later or contact support if the issue persists.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-emerald-700 transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 text-gray-900">
      <Head>
        <title>Traceability | {productMeta?.model || "Product Journey"}</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 md:py-24 space-y-20 md:space-y-28">

        {/* Header – More cinematic */}
        <header className="text-center space-y-8">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/70 backdrop-blur-lg border border-blue-100/50 rounded-full shadow-md text-blue-700 font-medium">
            <BadgeCheck className="w-5 h-5" />
            Verified on Cardano Blockchain
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Transparent{" "}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Product Journey
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {productMeta?.model || "Product"} — Immutable visibility from origin to delivery
          </p>
        </header>

        {/* Timeline – Enhanced with progress gradient & glow */}
        <section className="bg-white/70 backdrop-blur-xl border border-blue-100/50 rounded-3xl shadow-xl p-10 md:p-12 relative overflow-hidden">
          <h2 className="text-xl md:text-2xl font-bold mb-12 text-gray-800 text-center md:text-left">
            Supply Chain Milestones
          </h2>

          <div className="relative flex items-center justify-between pt-4 pb-16">
            {/* Progress line with gradient */}
            <div className="absolute top-7 left-0 right-0 h-2 bg-blue-100/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000 ease-out shadow-md"
                style={{
                  width: currentIndex >= 0 ? `${(currentIndex / (waypoints.length - 1)) * 100}%` : "0%",
                }}
              />
            </div>

            {waypoints.map((loc: string, index: number) => {
              const isPast = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isClickable = transactionLocations.some((l) => normalize(l) === normalize(loc));

              return (
                <div key={loc} className="relative z-10 flex flex-col items-center flex-1 group">
                  <button
                    onClick={() => isClickable && setSelectedStep(index)}
                    disabled={!isClickable}
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center border-4 shadow-lg transition-all duration-400",
                      isPast
                        ? "bg-emerald-500 text-white border-emerald-300 scale-105 group-hover:scale-110"
                        : isCurrent
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-300 ring-4 ring-blue-200/50 scale-125 animate-pulse"
                        : "bg-white text-gray-500 border-gray-200 group-hover:border-blue-300 group-hover:text-blue-600 group-hover:scale-110",
                      isClickable && "cursor-pointer"
                    )}
                  >
                    {isPast ? <Check className="w-7 h-7" /> : iconForLocation(loc)}
                  </button>

                  <span className="mt-4 text-sm md:text-base font-semibold text-gray-700 text-center leading-tight max-w-[110px] group-hover:text-blue-700 transition-colors">
                    {loc}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Grid – Cards with lift on hover */}
        <div className="grid lg:grid-cols-2 gap-10">

          {/* Current Milestone */}
          <div className="bg-white/80 backdrop-blur-xl border border-blue-100/50 rounded-3xl shadow-xl p-10 space-y-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-xl font-bold flex items-center gap-3 text-gray-800">
              <MapPin className="w-7 h-7 text-blue-600" />
              Current Milestone
            </h3>

            {selectedTx ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  {new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" }).format(
                    new Date(selectedTx.datetime * 1000)
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Action</p>
                  <p className="text-lg font-semibold mt-1">{selectedTx.action}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Status</p>
                  <span className="inline-flex px-4 py-1.5 mt-1.5 text-sm font-medium bg-emerald-100 text-emerald-800 rounded-full">
                    {selectedTx.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Transaction</p>
                  <Link
                    href={`https://preprod.cexplorer.io/tx/${selectedTx.txHash}`}
                    target="_blank"
                    className="text-sm font-mono text-blue-700 hover:text-blue-900 break-all hover:underline mt-1 block"
                  >
                    {selectedTx.txHash}
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 italic">No transaction recorded for this stage yet.</p>
            )}
          </div>

          {/* History */}
          <div className="bg-white/80 backdrop-blur-xl border border-blue-100/50 rounded-3xl shadow-xl p-10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-xl font-bold mb-8 text-gray-800">Transfer History</h3>

            <div className="space-y-5 max-h-[480px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50/50">
              {tracking.transaction_history.map((tx: any) => (
                <div
                  key={tx.txHash}
                  onClick={() => {
                    const idx = waypoints.findIndex((loc: any) => normalize(loc) === normalize(tx.metadata?.location || ""));
                    if (idx >= 0) setSelectedStep(idx);
                  }}
                  className={cn(
                    "p-6 border border-gray-200/70 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer",
                    normalize(tx.metadata?.location) === normalize(waypoints[selectedStep]) && "bg-blue-50/50 border-blue-300"
                  )}
                >
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-semibold text-gray-900">{tx.metadata?.location || "Unknown"}</span>
                    <span className="text-sm text-gray-500">
                      {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(tx.datetime * 1000))}
                    </span>
                  </div>
                  <p className="text-gray-700">{tx.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details */}
        {productMeta && (
          <section className="bg-white/80 backdrop-blur-xl border border-blue-100/50 rounded-3xl shadow-xl p-10 md:p-12 space-y-10 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: "Brand", value: productMeta.brand },
                { label: "Model", value: productMeta.model },
                { label: "Material", value: productMeta.material },
                { label: "Battery", value: productMeta.battery },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{item.label}</p>
                  <p className="text-lg font-semibold text-gray-900">{item.value || "—"}</p>
                </div>
              ))}
            </div>

            {productMeta.description && (
              <div className="pt-6 border-t border-gray-200/50">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Description</p>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {productMeta.description}
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}