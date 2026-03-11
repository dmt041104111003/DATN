 "use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import QRCode from "qrcode";
import { QrCode, Download, ExternalLink, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Header } from "@/components/Header";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
const CIP68_REF_PREFIX = "000643b0";


interface FormState {
  productName: string;
}

interface QRResult {
  qrCodeUrl: string | null;
  productUrl: string | null;
  productId: string | null;
  error: string | null;
}

export default function Create() {
  const [form, setForm] = useState<FormState>({
    productName: "",
  });
  const [issuers, setIssuers] = useState<string[]>([]);
  const [issuerInput, setIssuerInput] = useState("");
  const [qrResult, setQRResult] = useState<QRResult>({
    qrCodeUrl: null,
    productUrl: null,
    productId: null,
    error: null,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setQRResult({
        qrCodeUrl: null,
        productUrl: null,
        productId: null,
        error: null,
      });
      setSubmitted(false);
    },
    [],
  );

  const trimmedIssuers = useMemo(
    () => issuers.map((s) => s.trim()).filter(Boolean),
    [issuers],
  );

  const trimmedProductName = useMemo(
    () => form.productName.trim(),
    [form.productName],
  );

  const handleAddIssuer = useCallback(() => {
    const value = issuerInput.trim();
    if (!value) return;
    setIssuers((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setIssuerInput("");
    setQRResult({
      qrCodeUrl: null,
      productUrl: null,
      productId: null,
      error: null,
    });
    setSubmitted(false);
  }, [issuerInput]);

  const handleRemoveIssuer = useCallback((addr: string) => {
    setIssuers((prev) => prev.filter((v) => v !== addr));
  }, []);

  const handleMoveIssuer = useCallback((index: number, offset: number) => {
    setIssuers((prev) => {
      const next = [...prev];
      const targetIndex = index + offset;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  }, []);

  const handleClearIssuers = useCallback(() => {
    setIssuers([]);
    setQRResult({
      qrCodeUrl: null,
      productUrl: null,
      productId: null,
      error: null,
    });
    setSubmitted(false);
  }, []);

  const formatIssuer = useCallback((addr: string) => {
    if (addr.length <= 24) return addr;
    return `${addr.slice(0, 12)}...${addr.slice(-6)}`;
  }, []);

  const generateQRCode = useCallback(
    async (url: string): Promise<string | null> => {
      try {
        return await QRCode.toDataURL(url, {
          errorCorrectionLevel: "H",
          width: 512,
          margin: 4,
          color: { dark: "#1e293b", light: "#ffffff" },
        });
      } catch (err) {
        return null;
      }
    },
    [],
  );

  const {
    data: contractInfo,
    isLoading,
    isFetching,
    error: queryError,
  } = useQuery({
    queryKey: ["contract-info", trimmedIssuers],
    queryFn: async () => {
      const ownersParam = trimmedIssuers.join(",");
      const res = await fetch(
        `${BACKEND_URL}/contract/info?owners=${encodeURIComponent(ownersParam)}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Failed to fetch contract info");
      }
      return res.json();
    },
    enabled: submitted && trimmedIssuers.length > 0 && !!trimmedProductName,
    retry: 1,
    staleTime: 300_000,
  });

  useEffect(() => {
    if (!contractInfo?.policyId || !submitted || !trimmedProductName) return;

    const policyId = contractInfo.policyId as string;
    const hexName = Array.from(new TextEncoder().encode(trimmedProductName))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const unit = policyId + CIP68_REF_PREFIX + hexName;
    const productUrl = `${window.location.origin}/product/${encodeURIComponent(unit)}`;

    generateQRCode(productUrl).then((qrUrl) => {
      setQRResult({
        qrCodeUrl: qrUrl,
        productUrl,
        productId: unit,
        error: qrUrl ? null : "Failed to generate QR code",
      });
    });
  }, [contractInfo, submitted, trimmedProductName, generateQRCode]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!trimmedIssuers.length || !trimmedProductName) return;

      setQRResult({
        qrCodeUrl: null,
        productUrl: null,
        productId: null,
        error: null,
      });
      setSubmitted(true);
    },
    [trimmedIssuers, trimmedProductName],
  );

  const isProcessing =
    submitted && (isLoading || isFetching || !qrResult.qrCodeUrl);

  return (
    <>
      <Header />
      <main className="pt-[72px] md:pt-[88px] min-h-screen py-6 md:py-8 px-4 md:px-6">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-6 md:mb-8 space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-[0.18em]">
              CREATE QR
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Generate traceability QR code
            </h1>
            <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Generate a QR code that links directly to the official product traceability page.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 md:gap-6 items-stretch">
            <div className="bg-white border border-gray-200 rounded-none p-5 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Issuer(s) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    name="issuerInput"
                    type="text"
                    value={issuerInput}
                    onChange={(e) => setIssuerInput(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-4 focus:ring-[#c41e3a]/10 focus:border-[#c41e3a] transition-colors"
                    placeholder="Example: addr_test1q..., addr1q..."
                  />
                  <button
                    type="button"
                    onClick={handleAddIssuer}
                    className="px-4 py-3 bg-[#c41e3a] text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Add each issuer address separately.
                </p>
                {trimmedIssuers.length > 0 && (
                  <div className="mt-3 space-y-2 items-start">
                    {trimmedIssuers.map((addr, index) => (
                      <div
                        key={addr}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700 w-full justify-between"
                      >
                        <span className="truncate mr-2">{formatIssuer(addr)}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveIssuer(index, -1)}
                            className="text-gray-500 hover:text-gray-800"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveIssuer(index, 1)}
                            className="text-gray-500 hover:text-gray-800"
                            title="Move down"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveIssuer(addr)}
                            className="text-gray-500 hover:text-gray-800"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleClearIssuers}
                      className="text-xs text-[#c41e3a] hover:text-red-700"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="productName"
                  type="text"
                  required
                  value={form.productName}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-md focus:ring-4 focus:ring-[#c41e3a]/10 focus:border-[#c41e3a] transition-all"
                  placeholder="Example: Huawei Watch GT 4 Pro"
                />
              </div>

              {qrResult.error && (
                <p className="text-red-700 text-center font-medium bg-red-50 py-3 rounded-md">
                  {qrResult.error}
                </p>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-[#c41e3a] text-white font-semibold text-base rounded-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:bg-red-700 transition-colors"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    Generate QR Code
                  </>
                )}
              </button>
            </form>
          </div>

            <div className="bg-white border border-gray-200 rounded-none p-5 md:p-6 flex flex-col items-center justify-center">
            {qrResult.qrCodeUrl ? (
              <div className="text-center space-y-6">
                <div>
                  <p className="text-base font-medium text-gray-700 mb-2">
                    {form.productName}
                  </p>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <img
                    src={qrResult.qrCodeUrl}
                    alt="Product QR Code"
                    className="w-64 h-64 md:w-72 md:h-72 mx-auto"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={qrResult.qrCodeUrl}
                    download={`QR_${qrResult.productId?.replace(/[^a-zA-Z0-9]/g, "_") || "product"}.png`}
                    className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-[#c41e3a] text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download QR
                  </Link>

                  {qrResult.productUrl && (
                    <a
                      href={qrResult.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-[#c41e3a] text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      View Product Page
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center max-w-md mx-auto">
                <QrCode className="w-20 h-20 mx-auto mb-5 text-[#c41e3a]" />
                <p className="text-base font-medium text-gray-700">
                  Enter issuer address(es) and product name, then click Generate
                </p>
                <p className="text-gray-500 text-sm mt-3">
                  The QR code will link directly to the product page
                </p>

                {queryError && (
                  <p className="mt-5 text-red-700 font-medium text-sm">
                    Failed to fetch product data - please check the issuer addresses and product name, and ensure the product exists on the blockchain.
                  </p>
                )}
              </div>
            )}
          </div>
          </div>
        </div>
      </main>
    </>
  );
}