"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import QRCode from "qrcode";
import { QrCode, Download, ExternalLink, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/actions/product";
import Link from "next/link";

const CIP68_LABEL = "000643b0";
const MAX_ASSET_NAME_BYTES = 32;

interface FormState {
  issuers: string;
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
    issuers: "",
    productName: "",
  });
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

  const trimmedIssuers = useMemo(() => {
    return form.issuers
      .replace(/\n+/g, ",")
      .replace(/\s*,\s*/g, ",")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [form.issuers]);

  const trimmedProductName = useMemo(
    () => form.productName.trim(),
    [form.productName],
  );

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
    data: product,
    isLoading,
    isFetching,
    error: queryError,
  } = useQuery({
    queryKey: ["product", trimmedIssuers, trimmedProductName],
    queryFn: async () =>
      getProduct({
        owners: trimmedIssuers,
        assetName: trimmedProductName,
      }),
    enabled: submitted && trimmedIssuers.length > 0 && !!trimmedProductName,
    retry: 1,
    staleTime: 300_000,
  });

  useEffect(() => {
    if (!product || !submitted) return;

    const policyId = product.policyId as string;
    const assetName = product.assetName as string;

    const productUrl = `${window.location.origin}/product/${policyId + assetName}`;

    generateQRCode(productUrl).then((qrUrl) => {
      setQRResult({
        qrCodeUrl: qrUrl,
        productUrl,
        productId: policyId + assetName,
        error: qrUrl ? null : "Failed to generate QR code",
      });
    });
  }, [product, submitted, generateQRCode]);

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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-12 px-6 relative overflow-hidden">
      {/* Background decoration remains unchanged */}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-full shadow-sm">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-blue-800 font-semibold tracking-wide">
              Transparent Product Traceability
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Verify Product Origin
            <br className="hidden sm:block" />
          </h1>

          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Create CIP-68 compliant QR codes to enable instant product origin
            verification and build lasting consumer trust.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/50">
            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Issuer(s) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="issuers"
                  required
                  value={form.issuers}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-5 py-4 bg-white border ${
                    qrResult.error ? "border-red-500" : "border-slate-200"
                  } rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all `}
                  placeholder="Example: addr_test1q..., addr1q..."
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  One address per line or separated by commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="productName"
                  type="text"
                  required
                  value={form.productName}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  placeholder="Example: Huawei Watch GT 4 Pro"
                />
              </div>

              {qrResult.error && (
                <p className="text-red-600 text-center font-medium bg-red-50 py-3 rounded-xl">
                  {qrResult.error}
                </p>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate QR Code
                  </>
                )}
              </button>
            </form>
          </div>

          {/* QR Preview */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/50 flex flex-col items-center justify-center">
            {qrResult.qrCodeUrl ? (
              <div className="text-center space-y-6">
                <div>
                  <p className="text-lg font-medium text-slate-600 mb-2">
                    {form.productName}
                  </p>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-inner">
                  <img
                    src={qrResult.qrCodeUrl}
                    alt="Product QR Code"
                    className="w-80 h-80 mx-auto"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={qrResult.qrCodeUrl}
                    download={`QR_${qrResult.productId?.replace(/[^a-zA-Z0-9]/g, "_") || "product"}.png`}
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                    Download QR
                  </Link>

                  {qrResult.productUrl && (
                    <a
                      href={qrResult.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <ExternalLink className="w-5 h-5" />
                      View Product Page
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center max-w-md">
                <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-100 to-emerald-100 rounded-3xl flex items-center justify-center mb-8">
                  <QrCode className="w-32 h-32 text-blue-400" />
                </div>
                <p className="text-xl font-medium text-slate-600">
                  Enter issuer address(es) and product name, then click Generate
                </p>
                <p className="text-slate-500 mt-4">
                  The QR code will link directly to the product page
                </p>

                {queryError && (
                  <p className="mt-6 text-red-600 font-medium">
                    Failed to fetch product data - please check the issuer addresses and product name, and ensure the product exists on the blockchain.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}