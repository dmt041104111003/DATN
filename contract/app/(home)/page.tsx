import Link from 'next/link';
import { QrCode, Camera } from 'lucide-react';

export default function Page() {
  return (
    <main>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12 animate-in fade-in slide-in-from-top duration-700">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-blue-100 rounded-full">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="text-blue-800 font-semibold">Transparent Product Traceability</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Product <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Traceability</span>
              <br />
              System
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Ensure transparency and build consumer trust with modern QR code technology
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto mt-16">
            {/* Create QR Code Card */}
            <Link
              href="/create"
              className="group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <QrCode className="w-12 h-12 text-blue-600 group-hover:text-white transition-colors" />
                </div>

                <h2 className="text-3xl font-bold text-gray-800 group-hover:text-white transition-colors mb-4">
                  Create QR Code
                </h2>

                <p className="text-gray-600 group-hover:text-blue-50 transition-colors text-lg">
                  Enter product information<br />
                  and generate traceability QR codes instantly
                </p>

                <div className="mt-8 inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:text-white">
                  Start Creating
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Scan QR Code Card */}
            <Link
              href="/scan"
              className="group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Camera className="w-12 h-12 text-green-600 group-hover:text-white transition-colors" />
                </div>

                <h2 className="text-3xl font-bold text-gray-800 group-hover:text-white transition-colors mb-4">
                  Scan QR Code
                </h2>

                <p className="text-gray-600 group-hover:text-green-50 transition-colors text-lg">
                  Scan QR codes with your camera<br />
                  to view full product origin information
                </p>

                <div className="mt-8 inline-flex items-center gap-2 text-green-600 font-semibold group-hover:text-white">
                  Start Scanning
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-20 text-gray-500">
            <p className="text-sm">
              © 2026 Product Traceability System • Secure • Transparent • Reliable
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}