"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function HeroNew() {
  const [showFlow, setShowFlow] = React.useState(false);
  const router = useRouter();

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Mobile background image */}
      <div className="absolute inset-0 -z-10 md:hidden">
        <Image
          src="/a.png"
          alt="Banner truy xuất nguồn gốc"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="relative w-full max-w-5xl mx-auto px-4 min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-6rem)] flex items-start justify-center pt-28 md:pt-36 pb-10">
        <header className="text-center space-y-4">
          <p className="text-sm md:text-base font-medium text-gray-200 uppercase tracking-[0.18em]">
            Xác thực trên Cardano
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Hệ thống truy xuất nguồn gốc sản phẩm
          </h1>
          <p className="text-base md:text-lg text-gray-100 max-w-2xl mx-auto leading-relaxed">
            Quét QR để kiểm tra xuất xứ, hoặc tạo mã QR truy xuất cho sản phẩm.
          </p>
          <div className="mt-6 flex flex-col md:flex-row justify-center gap-3 md:gap-4 w-full max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setShowFlow(true)}
              className="w-full md:w-auto px-10 py-3 md:px-12 md:py-3.5 text-sm md:text-lg font-semibold text-white bg-[#c41e3a] hover:bg-red-700 rounded-full shadow-sm transition-colors"
            >
              Bắt đầu ngay
            </button>
            <button
              type="button"
              onClick={() => router.push("/scan")}
              className="w-full md:w-auto px-10 py-3 md:px-12 md:py-3.5 text-sm md:text-lg font-semibold text-[#c41e3a] bg-white/90 hover:bg-white rounded-full shadow-sm border border-[#c41e3a]/70 transition-colors"
            >
              Quét QR
            </button>
          </div>
        </header>
      </div>

      {showFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-2 md:px-6">
          <div className="relative w-full max-w-5xl h-[80vh]">
            <button
              type="button"
              onClick={() => setShowFlow(false)}
              className="absolute -top-3 -right-3 z-10 rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow px-2 py-1 text-xs font-semibold"
            >
              ✕
            </button>
            <div className="bg-white rounded-lg overflow-hidden w-full h-full flex items-center justify-center">
              <Image
                src="/flow.png"
                alt="Quy trình truy xuất nguồn gốc"
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

