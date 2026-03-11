"use client";

import * as React from "react";
import { AssetForm, type AssetFormMode, type InitialAssetData } from "../AssetForm";
import { AssetTable, type AssetRecord } from "../AssetTable";

export default function MintPage() {
  const [tab, setTab] = React.useState<"form" | "table">("form");
  const [formMode, setFormMode] = React.useState<AssetFormMode>("mint");
  const [selectedAsset, setSelectedAsset] = React.useState<AssetRecord | null>(null);

  const initialAsset = React.useMemo<InitialAssetData | null>(() => {
    if (!selectedAsset) return null;
    return {
      assetName: selectedAsset.assetName,
      owners: selectedAsset.owners,
      name: selectedAsset.name,
      description: selectedAsset.description,
      brand: selectedAsset.brand ?? null,
      model: selectedAsset.model ?? null,
      material: selectedAsset.material ?? null,
      notes: (selectedAsset as any).notes ?? null,
      battery: selectedAsset.battery ?? null,
      image: selectedAsset.image ?? null,
      mediaType: selectedAsset.mediaType ?? null,
      roadmap: selectedAsset.roadmap ?? null,
      location: selectedAsset.location ?? null,
    };
  }, [selectedAsset]);

  return (
    <div className="flex flex-col gap-4 w-full">
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
          Asset
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
          Asset table
        </button>
      </div>

      {tab === "form" ? (
        <AssetForm
          mode={formMode}
          initialAssetName={selectedAsset?.assetName}
          initialAsset={initialAsset}
        />
      ) : (
        <AssetTable
          onUpdate={(asset) => {
            setFormMode("update");
            setSelectedAsset(asset);
            setTab("form");
          }}
          onBurn={(asset) => {
            setFormMode("burn");
            setSelectedAsset(asset);
            setTab("form");
          }}
        />
      )}
    </div>
  );
}

