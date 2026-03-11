"use client";

import Image from "next/image";

export function FeatureSection() {
  return (
    <section className="w-full bg-white min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center space-y-3 md:space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Features
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            Explore the key capabilities of the Traceability platform, from QR
            verification to end‑to‑end supply chain visibility.
          </p>
        </div>

        <div className="mt-8 md:mt-10 flex justify-center">
          <div className="relative w-full max-w-4xl">
            <div className="relative w-full h-64 md:h-96">
              <Image
                src="/feature.png"
                alt="Traceability features"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

