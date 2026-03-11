'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ScanQR() {
  const [result, setResult] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAssetQr, setIsAssetQr] = useState(false);

  const handleScan = (results: any[]) => {
    if (results.length > 0 && !isPaused && !isProcessing) {
      setIsProcessing(true);
      const text = results[0].rawValue;
      setResult(text);
      setIsPaused(true);

      let asset = false;
      try {
        let url: URL | null = null;
        if (text.startsWith('http://') || text.startsWith('https://')) {
          url = new URL(text);
        } else if (typeof window !== 'undefined') {
          url = new URL(text, window.location.origin);
        }
        if (url && url.origin === window.location.origin && url.pathname.includes('/product/')) {
          asset = true;
        }
      } catch {
        asset = false;
      }
      setIsAssetQr(asset);

      if (asset) {
        setTimeout(() => {
          window.location.href = text;
        }, 1500);
      }
    }
  };

  const handleRestart = () => {
    setResult(null);
    setIsPaused(false);
    setIsProcessing(false);
    setIsAssetQr(false);
  };

  return (
    <main className="min-h-screen px-3 sm:px-4 py-6 md:py-8">
      <div className="max-w-lg mx-auto w-full space-y-4 md:space-y-5">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-[#c41e3a] hover:text-red-700 hover:underline"
          >
            <span>←</span>
            <span>Back to home</span>
          </Link>
          <p className="hidden md:block text-[11px] text-gray-500">
            Official traceability scanner
          </p>
        </div>

        <div className="p-0">
          <div className="relative aspect-square rounded-md overflow-hidden border border-gray-300 bg-black">
            <Scanner
              onScan={handleScan}
              paused={isPaused}
              constraints={{
                facingMode: 'environment',
                width: { ideal: 1280, min: 640 },
                height: { ideal: 720, min: 480 },
              }}
              scanDelay={100}
              formats={['qr_code']}
              styles={{
                container: { width: '100%', height: '100%' },
                video: { objectFit: 'cover', width: '100%', height: '100%' },
              }}
              components={{
                torch: true,
                zoom: true,
                finder: true,
              }}
              allowMultiple={false}
            />

            {/* Scan frame + animated scan line */}
            {!isPaused && !result && (
              <>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 md:w-56 md:h-56 border-4 border-dashed border-[#c41e3a]/45 rounded-2xl" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-48 h-48 md:w-56 md:h-56 overflow-hidden rounded-2xl border border-transparent">
                    <div
                      className="absolute left-0 right-0 h-1 md:h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"
                      style={{ animation: 'scanLine 2s linear infinite' }}
                    />
                  </div>
                </div>
              </>
            )}

            {result && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-md overflow-hidden">
                <div className="w-full px-4 py-6 text-center space-y-3 max-w-xs mx-auto">
                  {isAssetQr ? (
                    <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="w-14 h-14 text-red-500 mx-auto" />
                  )}
                  <p className="text-lg font-bold text-white">
                    {isAssetQr ? "Scan successful!" : "Scan failed"}
                  </p>
                  {isAssetQr ? (
                    <p className="text-white/90 text-sm">Redirecting…</p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-[#c41e3a] text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                    >
                      Scan again
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* No extra status/footer; all feedback is shown inside the scanner overlay */}
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