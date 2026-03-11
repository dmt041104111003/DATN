"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RoleSelect } from "../../components/RoleSelect";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type Role = { id: number; code: string };

export default function RoleSetupPage() {
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [stakeAddress, setStakeAddress] = React.useState<string | null>(null);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = React.useState<number | null>(
    null
  );
  const [displayName, setDisplayName] = React.useState<string>("");
  const [location, setLocation] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      document.cookie = "auth_token=; path=/; max-age=0";
      window.sessionStorage.removeItem("profile_setup");
      window.location.assign("/");
      return;
    }
    router.replace("/");
  };

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("profile_setup");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as {
        stakeAddress?: string;
        roles?: Role[];
      };
      if (!parsed?.stakeAddress) {
        router.replace("/");
        return;
      }
      setStakeAddress(parsed.stakeAddress);
      const rs =
        Array.isArray(parsed.roles) && parsed.roles.length > 0
          ? parsed.roles
          : ([
              { id: 1, code: "ENTERPRISE" },
              { id: 2, code: "TRANSIT" },
              { id: 3, code: "AGENT" },
            ] satisfies Role[]);
      setRoles(rs);
      setDisplayName("");
      setLocation("");
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = async () => {
    setError("");
    const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;
    if (!stakeAddress || !selectedRole || !displayName.trim() || !location.trim()) {
      setError("Please select a role and fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            document.cookie.split("auth_token=")[1]?.split(";")[0]
          }`,
        },
        body: JSON.stringify({
          roleCode: selectedRole.code,
          displayName: displayName.trim(),
          location: location.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to create profile"
        );
      }
      if (data?.token) {
        document.cookie = `auth_token=${data.token}; path=/; max-age=604800`;
      }
      if (typeof document !== "undefined") {
        window.sessionStorage.removeItem("profile_setup");
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating profile."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!stakeAddress) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f2f2f2] px-4 py-8 md:py-10">
      <div className="w-full max-w-2xl mx-auto">
        <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-6 md:px-8 md:py-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-600">
              Government Traceability Portal
            </p>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900 uppercase tracking-wide">
              Role registration
            </h1>
            <p className="mt-2 text-sm md:text-base text-gray-600 leading-relaxed">
              Select an authorized role and provide official information to activate your account.
            </p>
          </div>

          <div className="px-6 pb-6 md:px-8 md:pb-8 space-y-5">
          <RoleSelect
            roles={roles}
            selectedRoleId={selectedRoleId}
            onChange={setSelectedRoleId}
            disabled={submitting}
          />

          {selectedRoleId && (
            <>
              <div className="space-y-2">
                <label htmlFor="displayName" className="block text-sm font-semibold text-gray-800">
                  Organization / Operator name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={submitting}
                  className="w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-4 focus:ring-[#c41e3a]/10 focus:border-[#c41e3a] disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Example: HSUPPLY Logistics"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-semibold text-gray-800">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={submitting}
                  className="w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-4 focus:ring-[#c41e3a]/10 focus:border-[#c41e3a] disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Example: Ha Noi"
                />
              </div>
            </>
          )}

          <button
            type="button"
            className="w-full py-3.5 bg-[#c41e3a] text-white font-semibold text-base rounded-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
            onClick={handleSubmit}
            disabled={
              submitting ||
              !selectedRoleId ||
              !displayName.trim() ||
              !location.trim()
            }
          >
            {submitting ? "Submitting..." : "Submit registration"}
          </button>

          {error && (
            <div className="border border-red-200 bg-red-50 rounded-md px-4 py-3">
              <p className="text-sm font-medium text-red-700" role="alert">
                {error}
              </p>
            </div>
          )}

          <button
            type="button"
            className="w-full py-3.5 bg-white border border-gray-200 text-[#c41e3a] font-semibold text-base rounded-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-red-50/30 transition-colors"
            onClick={handleLogout}
            disabled={submitting}
          >
            Log out
          </button>
          </div>
        </section>
      </div>
    </main>
  );
}

