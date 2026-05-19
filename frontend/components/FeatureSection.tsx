"use client";

import Image from "next/image";
import { GovSectionHeader } from "./GovSectionHeader";

export function FeatureSection() {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="gov-section overflow-hidden">
          <GovSectionHeader index="03" title="Tính năng nổi bật" />
          <div className="gov-section-body w-full p-4 md:p-6">
            <p className="text-sm md:text-base text-gray-700 text-center max-w-2xl mx-auto mb-8 leading-relaxed">
              Xác thực QR, theo dõi chuỗi cung ứng đầu-cuối, ghi nhận on-chain và quản trị theo vai trò.
            </p>
            <div className="relative w-full max-w-4xl mx-auto h-64 md:h-96">
              <Image src="/feature.png" alt="Tính năng" fill className="object-contain" priority />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
