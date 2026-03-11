"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export default function DashboardProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<any | null>(null);
  const [displayName, setDisplayName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const load = async () => {
      try {
        const token = document.cookie
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("auth_token="))
          ?.split("=")[1];
        if (!token) {
          router.replace("/");
          return;
        }
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          router.replace("/");
          return;
        }
        const data = await res.json();
        setProfile(data.profile ?? null);
        setDisplayName(data.profile?.displayName ?? "");
        setLocation(data.profile?.location ?? "");
      } catch {
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    if (!location.trim()) {
      setError("Location is required.");
      return;
    }
    setSaving(true);
    try {
      const token = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("auth_token="))
        ?.split("=")[1];
      if (!token) {
        router.replace("/");
        return;
      }
      const res = await fetch(`${BACKEND_URL}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: displayName.trim(),
          location: location.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Failed to update profile");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while updating profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-3xl w-full space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">
              Profile
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              View your wallet profile and update basic information.
            </p>
          </div>
        </div>

        {profile && (
          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <dt className="font-semibold text-gray-700">Wallet address</dt>
              <dd className="font-mono text-gray-600 break-all bg-gray-50 border border-gray-200 rounded px-3 py-2">
                {profile.walletAddress}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="font-semibold text-gray-700">Role</dt>
              <dd className="text-gray-800">{profile.roleCode}</dd>
            </div>
            <div className="space-y-1">
              <dt className="font-semibold text-gray-700">Location</dt>
              <dd className="text-gray-800">{profile.location || "-"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="font-semibold text-gray-700">Status</dt>
              <dd className="text-gray-800">
                {profile.isActive ? "Active" : "Inactive"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="font-semibold text-gray-700">Created at</dt>
              <dd className="text-gray-600">
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleString()
                  : "-"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="font-semibold text-gray-700">Last updated</dt>
              <dd className="text-gray-600">
                {profile.updatedAt
                  ? new Date(profile.updatedAt).toLocaleString()
                  : "-"}
              </dd>
            </div>
          </dl>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900">
            Edit profile
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Update your display name.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Display name
            </label>
          <input
            disabled={saving}
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Location
            </label>
            <input
              disabled={saving}
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving || !displayName.trim() || !location.trim()}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-[#c41e3a] text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

