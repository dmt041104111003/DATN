"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { WarehouseForm } from "./WarehouseForm";
import { WarehouseTable, type Warehouse } from "./WarehouseTable";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export default function WarehousesPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = React.useState<"form" | "table">(
    tabParam === "table" ? "table" : "form"
  );

  React.useEffect(() => {
    if (searchParams.get("tab") === "table") setTab("table");
  }, [searchParams]);
  const [rows, setRows] = React.useState<Warehouse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [code, setCode] = React.useState("WH-001");
  const [name, setName] = React.useState("Main Warehouse");
  const [maxAssets, setMaxAssets] = React.useState<string>("");
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/warehouses`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message || data?.error || "Failed to load warehouses",
        );
      }
      const data = (await res.json()) as Warehouse[];
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        const res = await fetch(`${BACKEND_URL}/warehouses/${editingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: name.trim(),
            maxAssets: maxAssets.trim() ? Number(maxAssets.trim()) : null,
          }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || data?.error || "Failed to update warehouse");
        }
        setRows((prev) =>
          prev.map((w) =>
            w.id === editingId
              ? {
                  ...w,
                  name: name.trim(),
                  maxAssets: maxAssets.trim()
                    ? Number(maxAssets.trim())
                    : null,
                }
              : w,
          ),
        );
      } else {
        const res = await fetch(`${BACKEND_URL}/warehouses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            code: code.trim(),
            name: name.trim(),
            maxAssets: maxAssets.trim() ? Number(maxAssets.trim()) : null,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || data?.error || "Failed to create warehouse");
        }
        setRows((prev) => [data as Warehouse, ...prev]);
      }
      setCode("WH-001");
      setName("Main Warehouse");
      setMaxAssets("");
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: Warehouse) => {
    if (!window.confirm("Remove this warehouse?")) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/warehouses/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Failed to remove warehouse");
      }
      setRows((prev) => prev.filter((w) => w.id !== row.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          Warehouses
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage warehouse locations used across all roles.
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
          Create warehouse
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
          Warehouse list
        </button>
      </div>

      {tab === "form" ? (
        <WarehouseForm
          code={code}
          name={name}
          saving={saving}
          error={error}
          isEditing={Boolean(editingId)}
          onCodeChange={setCode}
          onNameChange={setName}
          maxAssets={maxAssets}
          onMaxAssetsChange={setMaxAssets}
          onSubmit={handleSubmit}
        />
      ) : (
        <WarehouseTable
          rows={rows}
          loading={loading}
          saving={saving}
          error={error}
          onDelete={handleDelete}
          onEdit={(row) => {
            setCode(row.code);
            setName(row.name);
            setMaxAssets(
              typeof row.maxAssets === "number" ? String(row.maxAssets) : "",
            );
            setEditingId(row.id);
            setTab("form");
          }}
        />
      )}
    </div>
  );
}

