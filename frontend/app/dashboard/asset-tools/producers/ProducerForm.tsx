"use client";

import * as React from "react";

type ProducerFormProps = {
  name: string;
  code: string;
  location: string;
  notes: string;
  saving: boolean;
  error: string;
  isEditing?: boolean;
  onNameChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function ProducerForm({
  name,
  code,
  location,
  notes,
  saving,
  error,
  isEditing = false,
  onNameChange,
  onCodeChange,
  onLocationChange,
  onNotesChange,
  onSubmit,
}: ProducerFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3 w-full">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Producer name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
              placeholder="HSUPPLY Farm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Code (optional)
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
              placeholder="PROD-001"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Location (optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
              placeholder="Ha Noi, Viet Nam"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              disabled={saving}
              className="w-full min-h-[60px] px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-[#c41e3a] text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving..." : isEditing ? "Update producer" : "Add producer"}
        </button>
      </form>
    </div>
  );
}

