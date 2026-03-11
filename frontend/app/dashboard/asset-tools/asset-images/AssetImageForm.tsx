"use client";

import * as React from "react";

type AssetImageFormProps = {
  fileUrl: string;
  name: string;
  type: string;
  saving?: boolean;
  onFileUrlChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSubmit: () => void;
};

export function AssetImageForm({
  fileUrl,
  name,
  type,
  saving = false,
  onFileUrlChange,
  onNameChange,
  onTypeChange,
  onSubmit,
}: AssetImageFormProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string>(fileUrl);

  React.useEffect(() => {
    setPreviewUrl(fileUrl);
  }, [fileUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileUrlChange(url);
    onNameChange(file.name || "");
    onTypeChange(file.type || "");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-base font-semibold text-gray-900 mb-3">
        Image form
      </h2>
      <div className="space-y-3">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Upload image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={saving}
            className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#c41e3a] file:text-white hover:file:bg-red-700"
          />
          {previewUrl && (
            <div className="mt-2 border border-gray-200 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center max-h-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 w-auto object-contain"
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Image name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={saving}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Image type
            </label>
            <input
              type="text"
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              disabled={saving}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#c41e3a] text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={saving || !fileUrl.trim()}
          >
            {saving ? "Saving..." : "Save to image table"}
          </button>
        </div>
      </div>
    </div>
  );
}

