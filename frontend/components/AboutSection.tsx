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
              Agri-food traceability
            </h2>
            <p className="text-sm md:text-base text-gray-700 md:text-gray-100 leading-relaxed text-justify">
              End-to-end traceability gives every stakeholder a verifiable story for
              each lot—from farm or packing house through logistics hubs to the final
              buyer. QR scanning surfaces what the product is, where it moved, and
              who was responsible at each leg of the journey.
            </p>
            <p className="text-sm md:text-base text-gray-700 md:text-gray-100 leading-relaxed text-justify">
              For operations teams, that cuts manual reconciliation and handoff errors.
              Warehouses and transit actors align on capacity and dispatch; updates carry
              cryptographically attested approvals so the provenance trail matches
              inventory in the field.
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed text-justify">
              For consumers and auditors, the same QR opens a trusted view of origin,
              quality claims and movement history. Shared ledger records keep the
              agri supply chain tamper-evident while staying practical to review.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
