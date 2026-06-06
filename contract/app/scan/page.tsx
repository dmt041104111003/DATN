// app/scan/page.tsx
'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';
import { Camera, CheckCircle, RotateCw, AlertCircle } from 'lucide-react';

export default function ScanQR() {
  const [result, setResult] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = (results: any[]) => {
    if (results.length > 0 && !isPaused && !isProcessing) {
      setIsProcessing(true);
      const text = results[0].rawValue;

      console.log('Scanned QR Code:', text);
      setResult(text);
      setIsPaused(true);

      if (text.includes(window.location.origin) && text.includes('/product/')) {
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
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-32 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 -right-32 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/50">
            <Camera className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-slate-700">Scan Product QR Code</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
            Point Camera at QR Code
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Place the QR code inside the frame to instantly view product origin and traceability information
          </p>
        </div>

        {/* Scanner Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/50">
          <div className="relative aspect-square">
            <Scanner
              onScan={handleScan}
              paused={isPaused}
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

            {/* Scanning guide overlay */}
            {!isPaused && !result && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-4 border-dashed border-blue-500/60 rounded-3xl animate-pulse" />
              </div>
            )}

            {/* Success overlay */}
            {result && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end">
                <div className="w-full p-8 text-center">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
                  <p className="text-2xl font-bold text-white mb-2">Scan Successful!</p>
                  {result.includes('/product/') && result.includes(window.location.origin) ? (
                    <p className="text-white/90">Redirecting to product details...</p>
                  ) : (
                    <p className="text-white/90 text-sm break-all bg-black/50 rounded-lg px-4 py-3 mt-4">
                      {result}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom section */}
          <div className="p-8 text-center space-y-6">
            {!result ? (
              <p className="text-gray-600 text-lg">
                Hold the QR code steady inside the frame for faster scanning
              </p>
            ) : (
              <div className="space-y-6">
                {!result.includes('/product/') && !result.includes(window.location.origin) && (
                  <div className="flex items-center justify-center gap-2 text-amber-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">This is not a system product QR code</span>
                  </div>
                )}

                <button
                  onClick={handleRestart}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold text-lg rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <RotateCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                  Scan Another Code
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>• Ensure good lighting • Keep 4-8 inches away • Hold steady</p>
        </div>
      </div>
    </main>
  );
}