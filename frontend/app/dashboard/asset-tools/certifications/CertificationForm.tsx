"use client";

import * as React from "react";

type CertificationFormProps = {
  name: string;
  issuer: string;
  certCode: string;
  validFrom: string;
  validTo: string;
  notes: string;
  saving: boolean;
  error: string;
  isEditing?: boolean;
  onNameChange: (v: string) => void;
  onIssuerChange: (v: string) => void;
  onCertCodeChange: (v: string) => void;
  onValidFromChange: (v: string) => void;
  onValidToChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function CertificationForm({
  name,
  issuer,
  certCode,
  validFrom,
  validTo,
  notes,
  saving,
  error,
  isEditing = false,
  onNameChange,
  onIssuerChange,
  onCertCodeChange,
  onValidFromChange,
  onValidToChange,
  onNotesChange,
  onSubmit,
}: CertificationFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3 w-full">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Certification name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
              placeholder="VietGAP, GlobalG.A.P, ..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Issuer (optional)
            </label>
            <input
              type="text"
              value={issuer}
              onChange={(e) => onIssuerChange(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
              placeholder="Issuing organization"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Cert code (optional)
            </label>
            <input
              type="text"
              value={certCode}
              onChange={(e) => onCertCodeChange(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Valid from
            </label>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => onValidFromChange(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Valid to
            </label>
            <input
              type="date"
              value={validTo}
              onChange={(e) => onValidToChange(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            disabled={saving}
            className="w-full min-h-[70px] px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-[#c41e3a] text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {saving
            ? "Saving..."
            : isEditing
              ? "Update certification"
              : "Add certification"}
        </button>
      </form>
    </div>
  );
}

