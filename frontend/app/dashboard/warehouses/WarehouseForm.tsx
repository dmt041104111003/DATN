import * as React from "react";

type WarehouseFormProps = {
  code: string;
  name: string;
  saving: boolean;
  error: string;
  isEditing?: boolean;
  onCodeChange: (value: string) => void;
  onNameChange: (value: string) => void;
  maxAssets: string;
  onMaxAssetsChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function WarehouseForm({
  code,
  name,
  saving,
  error,
  isEditing = false,
  onCodeChange,
  onNameChange,
  maxAssets,
  onMaxAssetsChange,
  onSubmit,
}: WarehouseFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3 w-full">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
            disabled={saving || isEditing}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
              placeholder="WH-001"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Max assets (optional)
            </label>
            <input
              type="number"
              min={0}
              value={maxAssets}
              onChange={(e) => onMaxAssetsChange(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
              placeholder="e.g. 100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
              placeholder="Main warehouse"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving || !code.trim() || !name.trim()}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-[#c41e3a] text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {saving
            ? "Saving..."
            : isEditing
              ? "Update warehouse"
              : "Add warehouse"}
        </button>
      </form>
    </div>
  );
}

