"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GovSectionHeader } from "./GovSectionHeader";

export function HeroNew() {
  const [showFlow, setShowFlow] = React.useState(false);
  const router = useRouter();

  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-6rem)] flex items-center justify-center pt-24 md:pt-32 pb-12">
        <header className="gov-hero-text text-center space-y-5 max-w-3xl w-full">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">
            Truy xuất nguồn gốc sản phẩm
          </h1>
          <p className="text-base md:text-lg text-white leading-relaxed">
            Quét QR kiểm tra xuất xứ — minh bạch chuỗi cung ứng, xác thực on-chain.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3 w-full max-w-lg mx-auto">
            <button type="button" onClick={() => setShowFlow(true)} className="gov-btn-primary px-8 py-3 text-sm md:text-base">
              Bắt đầu ngay
            </button>
            <button type="button" onClick={() => router.push("/trace-scan")} className="gov-btn-outline px-8 py-3 text-sm md:text-base">
              Quét truy xuất
            </button>
          </div>
        </header>
      </div>

      {showFlow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4">
          <div className="relative w-full max-w-5xl max-h-[85vh] gov-section overflow-hidden">
            <GovSectionHeader index="01" title="Quy trình truy xuất" />
            <button
              type="button"
              onClick={() => setShowFlow(false)}
              className="absolute top-2 right-2 z-10 bg-[#8f1529] text-white px-2 py-1 text-xs font-bold border border-[#d4af37]"
            >
              Đóng
            </button>
            <div className="gov-card p-3 flex items-center justify-center min-h-[50vh]">
              <Image src="/flow.png" alt="Quy trình" width={1200} height={800} className="max-w-full max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
