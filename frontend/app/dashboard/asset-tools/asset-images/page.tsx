"use client";

import * as React from "react";
import { AssetImageForm } from "./AssetImageForm";
import { AssetImageTable, type AssetImageRow } from "./AssetImageTable";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export default function AssetImagesPage() {
  const [tab, setTab] = React.useState<"form" | "table">("form");
  const [fileUrl, setFileUrl] = React.useState("");
  const [imageName, setImageName] = React.useState("");
  const [imageType, setImageType] = React.useState("");
  const [images, setImages] = React.useState<AssetImageRow[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/asset-images`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          id: string;
          ownerWalletAddress: string;
          name: string;
          mimeType: string;
          ipfsHash: string;
          url: string;
          createdAt: string;
        }[];
        if (Array.isArray(data)) {
          setImages(
            data.map((img) => ({
              id: img.id,
              name: img.name,
              type: img.mimeType,
              input: img.url,
              previewUrl: img.url,
              createdAt: img.createdAt,
            })),
          );
        }
      } catch {
        // ignore
      }
    };

    load();
  }, []);

  const handleAdd = React.useCallback(async () => {
    const value = fileUrl.trim();
    if (!value || saving) return;
    setSaving(true);
    try {
      if (editingId != null) {
        await fetch(`${BACKEND_URL}/asset-images/${encodeURIComponent(editingId)}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: imageName.trim() || "Asset image",
            mimeType: imageType.trim() || "image/*",
          }),
        });
        setImages((prev) =>
          prev.map((row) =>
            row.id === editingId
              ? {
                  ...row,
                  name: imageName.trim() || "Asset image",
                  type: imageType.trim() || "image/*",
                }
              : row,
          ),
        );
      } else {
        const form = new FormData();
        const res = await fetch(value);
        const blob = await res.blob();
        const fileName = imageName.trim() || "asset-image.png";
        const file = new File([blob], fileName, {
          type: imageType.trim() || blob.type || "image/*",
        });
        form.append("file", file);
        form.append("name", fileName);
        if (imageType.trim()) {
          form.append("mimeType", imageType.trim());
        }

        const uploadRes = await fetch(`${BACKEND_URL}/asset-images/upload`, {
          method: "POST",
          credentials: "include",
          body: form,
        });
        const img = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(img?.message || img?.error || "Failed to upload image");
        }

        setImages((prev) => [
          {
            id: img.id as string,
            name: img.name,
            type: img.mimeType,
            input: img.url,
            previewUrl: img.url,
            createdAt: img.createdAt,
          },
          ...prev,
        ]);
      }

      setFileUrl("");
      setImageName("");
      setImageType("");
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert(
        e instanceof Error ? e.message : "Failed to save image. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }, [fileUrl, imageName, imageType, saving, editingId]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          Asset images
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage IPFS image references for your assets.
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
          Image form
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
          Image table
        </button>
      </div>

      {tab === "form" ? (
        <AssetImageForm
          fileUrl={fileUrl}
          name={imageName}
          type={imageType}
          saving={saving}
          onFileUrlChange={setFileUrl}
          onNameChange={setImageName}
          onTypeChange={setImageType}
          onSubmit={handleAdd}
        />
      ) : (
        <AssetImageTable
          rows={images}
          saving={saving}
          onEdit={(row) => {
            setFileUrl(row.previewUrl || row.input);
            setImageName(row.name);
            setImageType(row.type);
            setEditingId(row.id);
            setTab("form");
          }}
          onDelete={(row) => {
            if (saving) return;
            if (
              typeof window !== "undefined" &&
              !window.confirm("Delete this image from library?")
            ) {
              return;
            }
            const doDelete = async () => {
              try {
                const res = await fetch(
                  `${BACKEND_URL}/asset-images/${encodeURIComponent(row.id)}`,
                  {
                    method: "DELETE",
                    credentials: "include",
                  },
                );
                if (!res.ok) {
                  const data = await res.json().catch(() => null);
                  throw new Error(
                    data?.message || data?.error || "Failed to delete image",
                  );
                }

                setImages((prev) => prev.filter((r) => r.id !== row.id));
                if (editingId === row.id) {
                  setFileUrl("");
                  setImageName("");
                  setImageType("");
                  setEditingId(null);
                }
              } catch (e) {
                console.error(e);
                alert(
                  e instanceof Error
                    ? e.message
                    : "Failed to delete image. Please try again.",
                );
              }
            };
            void doDelete();
          }}
        />
      )}
    </div>
  );
}


