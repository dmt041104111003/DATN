 "use client";

import * as React from "react";
import { BurnForm } from "./BurnForm";
import { BurnHistoryTable } from "./BurnHistoryTable";

export default function BurnPage() {
  const [tab, setTab] = React.useState<"retire" | "history">("retire");

  return (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          Retire assets
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Safely retire product NFTs from your warehouses and keep a full burn history.
        </p>
      </div>

      <div className="flex border-b border-gray-200 text-base">
        <button
          type="button"
          onClick={() => setTab("retire")}
          className={`px-4 py-3 -mb-px border-b-2 transition-colors ${
            tab === "retire"
              ? "border-[#c41e3a] text-[#c41e3a] font-semibold"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Retire
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={`px-4 py-3 -mb-px border-b-2 transition-colors ${
            tab === "history"
              ? "border-[#c41e3a] text-[#c41e3a] font-semibold"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Burn history
        </button>
      </div>

      {tab === "retire" && <BurnForm />}
      {tab === "history" && <BurnHistoryTable />}
    </div>
  );
}

