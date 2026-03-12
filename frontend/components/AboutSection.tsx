"use client";

import Image from "next/image";

export function AboutSection() {
  return (
    <section className="w-full min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-[4fr_3fr] gap-8 md:gap-14 items-center">
          <div className="relative w-full min-h-[380px] md:min-h-[520px]">
            <Image
              src="/b.png"
              alt="About"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 md:text-white">
              About Traceability
            </h2>
            <p className="text-sm md:text-base text-gray-700 md:text-gray-100 leading-relaxed text-justify">
              Traceability gives your team a clear, verifiable story for every
              product—from production to warehouse, shipping, and final receipt.
              With QR scanning, anyone can quickly check what the item is, where
              it has been, and which party is responsible at each step.
            </p>
            <p className="text-sm md:text-base text-gray-700 md:text-gray-100 leading-relaxed text-justify">
              In operations, this reduces manual reconciliation and prevents
              missing handoffs. Warehouses can enforce capacity limits, orders
              can be confirmed by wallet signing, and every status change is
              reflected consistently across the dashboard.
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed text-justify">
              On the customer side, the same QR provides a trusted view into
              origin and movement history. Combined with immutable on-chain
              records, your supply chain data stays tamper-resistant while
              remaining easy to access and audit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

