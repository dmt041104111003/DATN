"use client";

import * as React from "react";
import { ProducerForm } from "./ProducerForm";
import { ProducerTable, type ProducerRow } from "./ProducerTable";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export default function ProducersPage() {
  const [tab, setTab] = React.useState<"form" | "table">("form");
  const [name, setName] = React.useState("HSUPPLY Farm");
  const [code, setCode] = React.useState("PROD-001");
  const [location, setLocation] = React.useState("Ha Noi, Viet Nam");
  const [notes, setNotes] = React.useState("Key producer for organic mango supply chain");
  const [rows, setRows] = React.useState<ProducerRow[]>([]);
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
        const res = await fetch(`${BACKEND_URL}/producers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = (await res.json()) as ProducerRow[];
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
        location: location.trim() || null,
        notes: notes.trim() || null,
      };
      if (editingId) {
        const res = await fetch(
          `${BACKEND_URL}/producers/${encodeURIComponent(editingId)}`,
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
            data?.message || data?.error || "Failed to update producer",
          );
        }
        setRows((prev) =>
          prev.map((r) =>
            r.id === editingId
              ? {
                  ...r,
                  name: payload.name,
                  code: payload.code ?? null,
                  location: payload.location ?? null,
                  notes: payload.notes ?? null,
                }
              : r,
          ),
        );
      } else {
        const res = await fetch(`${BACKEND_URL}/producers`, {
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
            data?.message || data?.error || "Failed to create producer",
          );
        }
        setRows((prev) => [data as ProducerRow, ...prev]);
      }
      setName("");
      setCode("");
      setLocation("");
      setNotes("");
      setEditingId(null);
      setTab("table");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to save producer. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: ProducerRow) => {
    if (saving) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this producer?")
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
        `${BACKEND_URL}/producers/${encodeURIComponent(row.id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to delete producer",
        );
      }
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      if (editingId === row.id) {
        setName("");
        setCode("");
        setLocation("");
        setNotes("");
        setEditingId(null);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to delete producer. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          Producers
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage producer names used in asset metadata.
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
          Producer form
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
          Producer table
        </button>
      </div>

      {tab === "form" ? (
        <ProducerForm
          name={name}
          code={code}
          location={location}
          notes={notes}
          saving={saving}
          error={error}
          isEditing={Boolean(editingId)}
          onNameChange={setName}
          onCodeChange={setCode}
          onLocationChange={setLocation}
          onNotesChange={setNotes}
          onSubmit={handleSubmit}
        />
      ) : (
        <ProducerTable
          rows={rows}
          loading={loading}
          saving={saving}
          error={error}
          onEdit={(row) => {
            setName(row.name);
            setCode(row.code ?? "");
            setLocation(row.location ?? "");
            setNotes(row.notes ?? "");
            setEditingId(row.id);
            setTab("form");
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

