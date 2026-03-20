"use client";

import * as React from "react";
import { CertificationForm } from "./CertificationForm";
import { CertificationTable, type CertificationRow } from "./CertificationTable";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export default function CertificationsPage() {
  const [tab, setTab] = React.useState<"form" | "table">("form");
  const [name, setName] = React.useState("VietGAP");
  const [issuer, setIssuer] = React.useState("Department of Agriculture");
  const [certCode, setCertCode] = React.useState("CERT-001");
  const [validFrom, setValidFrom] = React.useState("");
  const [validTo, setValidTo] = React.useState("");
  const [notes, setNotes] = React.useState("Organic certification for mango batch");
  const [rows, setRows] = React.useState<CertificationRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/certifications`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = (await res.json()) as CertificationRow[];
        setRows(Array.isArray(data) ? data : []);
      } catch {
        // ignore
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
      const payload = {
        name: name.trim(),
        issuer: issuer.trim() || null,
        certCode: certCode.trim() || null,
        validFrom: validFrom || null,
        validTo: validTo || null,
        notes: notes.trim() || null,
      };
      if (editingId) {
        const res = await fetch(
          `${BACKEND_URL}/certifications/${encodeURIComponent(editingId)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
          },
        );
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(
            data?.message || data?.error || "Failed to update certification",
          );
        }
        setRows((prev) =>
          prev.map((r) =>
            r.id === editingId
              ? {
                  ...r,
                  name: payload.name,
                  issuer: payload.issuer ?? null,
                  certCode: payload.certCode ?? null,
                  notes: payload.notes ?? null,
                }
              : r,
          ),
        );
      } else {
        const res = await fetch(`${BACKEND_URL}/certifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data?.message || data?.error || "Failed to create certification",
          );
        }
        setRows((prev) => [data as CertificationRow, ...prev]);
      }
      setName("");
      setIssuer("");
      setCertCode("");
      setValidFrom("");
      setValidTo("");
      setNotes("");
      setEditingId(null);
      setTab("table");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to save certification. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: CertificationRow) => {
    if (saving) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this certification?")
    ) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `${BACKEND_URL}/certifications/${encodeURIComponent(row.id)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to delete certification",
        );
      }
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      if (editingId === row.id) {
        setName("");
        setIssuer("");
        setCertCode("");
        setValidFrom("");
        setValidTo("");
        setNotes("");
        setEditingId(null);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to delete certification. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          Certifications
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage certification metadata to reuse across assets.
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
          Certification form
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
          Certification table
        </button>
      </div>

      {tab === "form" ? (
        <CertificationForm
          name={name}
          issuer={issuer}
          certCode={certCode}
          validFrom={validFrom}
          validTo={validTo}
          notes={notes}
          saving={saving}
          error={error}
          isEditing={Boolean(editingId)}
          onNameChange={setName}
          onIssuerChange={setIssuer}
          onCertCodeChange={setCertCode}
          onValidFromChange={setValidFrom}
          onValidToChange={setValidTo}
          onNotesChange={setNotes}
          onSubmit={handleSubmit}
        />
      ) : (
        <CertificationTable
          rows={rows}
          loading={loading}
          saving={saving}
          error={error}
          onEdit={(row) => {
            setName(row.name);
            setIssuer(row.issuer ?? "");
            setCertCode(row.certCode ?? "");
            setValidFrom(row.validFrom ? row.validFrom.slice(0, 10) : "");
            setValidTo(row.validTo ? row.validTo.slice(0, 10) : "");
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

