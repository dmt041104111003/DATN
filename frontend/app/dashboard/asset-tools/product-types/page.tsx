"use client";

import * as React from "react";
import { ProductTypeForm } from "./ProductTypeForm";
import { ProductTypeTable, type ProductTypeRow } from "./ProductTypeTable";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export default function ProductTypesPage() {
  const [tab, setTab] = React.useState<"form" | "table">("form");
  const [name, setName] = React.useState("Mango (Cat Chu)");
  const [code, setCode] = React.useState("TYPE-001");
  const [rows, setRows] = React.useState<ProductTypeRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        const cookie =
          typeof document !== "undefined"
            ? document.cookie
                .split(";")
                .map((c) => c.trim())
                .find((c) => c.startsWith("auth_token="))
            : null;
        const token = cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/product-types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = (await res.json()) as ProductTypeRow[];
        setRows(Array.isArray(data) ? data : []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const cookie = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("auth_token="));
      const token = cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
      if (!token) {
        throw new Error("Unauthorized. Please sign in again.");
      }
      const payload = {
        name: name.trim(),
        code: code.trim() || null,
      };
      if (editingId) {
        const res = await fetch(
          `${BACKEND_URL}/product-types/${encodeURIComponent(editingId)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(
            data?.message || data?.error || "Failed to update product type",
          );
        }
        setRows((prev) =>
          prev.map((r) =>
            r.id === editingId
              ? { ...r, name: payload.name, code: payload.code ?? null }
              : r,
          ),
        );
      } else {
        const res = await fetch(`${BACKEND_URL}/product-types`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data?.message || data?.error || "Failed to create product type",
          );
        }
        setRows((prev) => [data as ProductTypeRow, ...prev]);
      }
      setName("");
      setCode("");
      setEditingId(null);
      setTab("table");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to save product type. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: ProductTypeRow) => {
    if (saving) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this product type?")
    ) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      const cookie = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("auth_token="));
      const token = cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
      if (!token) {
        throw new Error("Unauthorized. Please sign in again.");
      }
      const res = await fetch(
        `${BACKEND_URL}/product-types/${encodeURIComponent(row.id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to delete product type",
        );
      }
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      if (editingId === row.id) {
        setName("");
        setCode("");
        setEditingId(null);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to delete product type. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          Product types
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage product type options used in asset metadata.
        </p>
      </div>

      <div className="flex border-b border-gray-200 text-base">
        <button
          type="button"
          onClick={() => setTab("form")}
          className={`px-4 py-3 -mb-px border-b-2 transition-colors ${
            tab === "form"
              ? "border-[#c41e3a] text-[#c41e3a] font-semibold"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Product type form
        </button>
        <button
          type="button"
          onClick={() => setTab("table")}
          className={`px-4 py-3 -mb-px border-b-2 transition-colors ${
            tab === "table"
              ? "border-[#c41e3a] text-[#c41e3a] font-semibold"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Product type table
        </button>
      </div>

      {tab === "form" ? (
        <ProductTypeForm
          name={name}
          code={code}
          saving={saving}
          error={error}
          isEditing={Boolean(editingId)}
          onNameChange={setName}
          onCodeChange={setCode}
          onSubmit={handleSubmit}
        />
      ) : (
        <ProductTypeTable
          rows={rows}
          loading={loading}
          saving={saving}
          error={error}
          onEdit={(row) => {
            setName(row.name);
            setCode(row.code ?? "");
            setEditingId(row.id);
            setTab("form");
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

