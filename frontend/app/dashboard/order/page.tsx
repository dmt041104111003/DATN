 "use client";

import * as React from "react";
import { OrderForm } from "./OrderForm";
import { OrderTables } from "./OrderTables";

export default function OrderPage() {
  const [tab, setTab] = React.useState<"send" | "sent" | "incoming">("send");

  return (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          Order
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Create shipments and manage sent/incoming orders.
        </p>
      </div>

      <div className="flex border-b border-gray-200 text-base">
        <button
          type="button"
          onClick={() => setTab("send")}
          className={`px-4 py-3 -mb-px border-b-2 transition-colors ${
            tab === "send"
              ? "border-[#c41e3a] text-[#c41e3a] font-semibold"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Send
        </button>
        <button
          type="button"
          onClick={() => setTab("sent")}
          className={`px-4 py-3 -mb-px border-b-2 transition-colors ${
            tab === "sent"
              ? "border-[#c41e3a] text-[#c41e3a] font-semibold"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Sent orders
        </button>
        <button
          type="button"
          onClick={() => setTab("incoming")}
          className={`px-4 py-3 -mb-px border-b-2 transition-colors ${
            tab === "incoming"
              ? "border-[#c41e3a] text-[#c41e3a] font-semibold"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Incoming orders
        </button>
      </div>

      {tab === "send" && <OrderForm />}
      {tab === "sent" && <OrderTables tab="sent" />}
      {tab === "incoming" && <OrderTables tab="incoming" />}
    </div>
  );
}
