"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ENTERPRISE_ROUTES } from "@/app/enterprise/constants/routes";
import { WarehouseForm } from "./WarehouseForm";
import { WarehouseTable } from "./WarehouseTable";
import type { WarehouseRow } from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

function generateWarehouseCode() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const time = Date.now().toString(36).slice(-6).toUpperCase();
  return `WH-${time}-${rand}`;
}

async function apiJson<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(
      (data && (data.message || data.error)) || text || "Request failed",
    );
  }
  return data as T;
}

export default function Page() {
  const [tab, setTab] = React.useState<"form" | "table">("form");
  const [rows, setRows] = React.useState<WarehouseRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {},
  );

  const [code, setCode] = React.useState(generateWarehouseCode());
  const [name, setName] = React.useState("Main warehouse");
  const [maxProducts, setMaxProducts] = React.useState<string>("");
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [detailsRow, setDetailsRow] = React.useState<WarehouseRow | null>(null);

  const load = React.useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiJson<WarehouseRow[]>("/warehouses", { method: "GET" });
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(String(e?.message || e || "Failed to load warehouses."));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const clearForm = React.useCallback(() => {
    setError("");
    setFieldErrors({});
    setCode(generateWarehouseCode());
    setName("Main warehouse");
    setMaxProducts("");
    setEditingId(null);
    setTab("form");
  }, []);

  const validateForm = React.useCallback(() => {
    const errs: Record<string, string> = {};
    const codeTrim = String(code || "").trim();
    const nameTrim = String(name || "").trim();
    const maxTrim = String(maxProducts || "").trim();

    if (!codeTrim) errs.code = "Required.";
    if (!nameTrim) errs.name = "Required.";
    if (!maxTrim) errs.maxProducts = "Required.";
    if (maxTrim) {
      const n = Number(maxTrim);
      if (!Number.isFinite(n) || n <= 0) errs.maxProducts = "Must be a number > 0.";
    }

    if (nameTrim) {
      const dupe = rows.some((r) => {
        if (editingId && String(r.id) === String(editingId)) return false;
        return String(r.name || "").trim().toLowerCase() === nameTrim.toLowerCase();
      });
      if (dupe) errs.name = "This warehouse name already exists. Please choose another name.";
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length) throw new Error("Please fix the highlighted fields.");
  }, [code, name, maxProducts, rows, editingId]);

  const onSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        validateForm();
      } catch (err: any) {
        setError(String(err?.message || err || "Invalid form."));
        return;
      }
      setSaving(true);
      setError("");
      try {
        if (editingId) {
          const updated = await apiJson<WarehouseRow>(`/warehouses/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify({
              name: name.trim(),
              maxProducts: Number(maxProducts.trim()),
            }),
          });
          setRows((prev) => prev.map((w) => (w.id === editingId ? updated : w)));
        } else {
          const created = await apiJson<WarehouseRow>("/warehouses", {
            method: "POST",
            body: JSON.stringify({
              code: code.trim(),
              name: name.trim(),
              maxProducts: Number(maxProducts.trim()),
            }),
          });
          setRows((prev) => [created, ...prev]);
        }
        clearForm();
        setTab("table");
      } catch (e: any) {
        setError(String(e?.message || e || "Failed."));
      } finally {
        setSaving(false);
      }
    },
    [editingId, code, name, maxProducts, clearForm, validateForm],
  );

  const onDelete = React.useCallback(async (row: WarehouseRow) => {
    if (typeof window !== "undefined") {
      if (!window.confirm("Remove this warehouse?")) return;
    }
    setSaving(true);
    setError("");
    try {
      await apiJson(`/warehouses/${encodeURIComponent(row.id)}`, { method: "DELETE" });
      setRows((prev) => prev.filter((w) => w.id !== row.id));
      if (detailsRow?.id === row.id) {
        setDetailsOpen(false);
        setDetailsRow(null);
      }
    } catch (e: any) {
      setError(String(e?.message || e || "Failed to remove warehouse."));
    } finally {
      setSaving(false);
    }
  }, [detailsRow?.id]);

  const disabled = loading || saving;

  return (
    <div className="flex w-full flex-col gap-4">
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "form" | "table")}
        className="w-full gap-4"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="form">
            {editingId ? "Edit warehouse" : "Register warehouse"}
          </TabsTrigger>
          <TabsTrigger value="table">Warehouse register</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-0">
          <WarehouseForm
            code={code}
            name={name}
            saving={saving}
            error={error}
            fieldErrors={fieldErrors}
            isEditing={Boolean(editingId)}
            onCodeChange={setCode}
            onNameChange={(v) => {
              setName(v);
              setFieldErrors((m) => ({ ...m, name: "" }));
              setError("");
            }}
            maxProducts={maxProducts}
            onMaxProductsChange={(v) => {
              setMaxProducts(v);
              setFieldErrors((m) => ({ ...m, maxProducts: "" }));
              setError("");
            }}
            onSubmit={onSubmit}
            onCancel={clearForm}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <WarehouseTable
            routePrefix={ENTERPRISE_ROUTES.workspace}
            rows={rows}
            loading={loading}
            saving={saving}
            error={error}
            onDelete={onDelete}
            onEdit={(row) => {
              setError("");
              setCode(row.code);
              setName(row.name);
              setMaxProducts(
                typeof row.maxProducts === "number" ? String(row.maxProducts) : "",
              );
              setEditingId(row.id);
              setTab("form");
            }}
          />
        </TabsContent>
      </Tabs>

    </div>
  );
}
