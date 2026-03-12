"use client";

import { User, Truck, Building2 } from "lucide-react";

export function AudienceSection() {
  return (
    <section className="w-full min-h-screen flex items-center bg-slate-50/80">
      <div className="max-w-6xl mx-auto px-4 pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Who is Traceability for?
          </h2>
        </div>
        <div className="w-full max-w-4xl mx-auto space-y-8">
          {/* Consumer */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="flex-shrink-0 text-[#c41e3a]">
              <User className="w-8 h-8 md:w-9 md:h-9" />
            </div>
            <div className="flex-1 border-b border-[#c41e3a]/40 pb-5">
              <h3 className="text-base md:text-lg font-bold text-[#c41e3a] mb-1">
                Consumer:
              </h3>
              <p className="text-sm md:text-base text-gray-800 leading-relaxed text-justify">
                Traceability provides all the information consumers need about
                the food they are consuming. However, it can have different
                meanings depending on your role in the supply chain.
              </p>
            </div>
          </div>

          {/* Distributor / Agent */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="flex-shrink-0 text-[#c41e3a]">
              <Truck className="w-8 h-8 md:w-9 md:h-9" />
            </div>
            <div className="flex-1 border-b border-[#c41e3a]/40 pb-5">
              <h3 className="text-base md:text-lg font-bold text-[#c41e3a] mb-1">
                Distributor / Agent:
              </h3>
              <p className="text-sm md:text-base text-gray-800 leading-relaxed text-justify">
                For a distributor or agent, traceability streamlines inventory
                management, ensures product integrity throughout distribution,
                and speeds up product flow, enhancing overall supply chain
                efficiency.
              </p>
            </div>
          </div>

          {/* Enterprise */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="flex-shrink-0 text-[#c41e3a]">
              <Building2 className="w-8 h-8 md:w-9 md:h-9" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-base md:text-lg font-bold text-[#c41e3a]">
                Enterprise:
              </h3>
              <p className="text-sm md:text-base text-gray-800 leading-relaxed text-justify">
                For a food enterprise, traceability conveys the idea of a
                responsible brand and builds immediate differentiation in a
                crowded market.
              </p>
              <p className="text-sm md:text-base text-gray-800 leading-relaxed text-justify">
                For a company, traceability means responsible sourcing, brand
                protection, meeting global trade standards, and attracting
                responsible customers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

