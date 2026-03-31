"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<{
    walletAddress?: string;
    roleCode?: string;
    location?: string | null;
    isActive?: boolean;
    displayName?: string;
    createdAt?: string;
    updatedAt?: string;
  } | null>(null);
  const [displayName, setDisplayName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
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
      const res = await fetch(`${BACKEND_URL}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
        err instanceof Error
          ? err.message
          : "An error occurred while updating profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            View your wallet profile and update basic information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile && (
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="text-muted-foreground font-medium">
                  Wallet address
                </dt>
                <dd className="bg-muted rounded-md border px-3 py-2 font-mono break-all">
                  {profile.walletAddress}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground font-medium">Role</dt>
                <dd>{profile.roleCode}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground font-medium">Location</dt>
                <dd>{profile.location || "-"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground font-medium">Status</dt>
                <dd>{profile.isActive ? "Active" : "Inactive"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground font-medium">Created at</dt>
                <dd className="text-muted-foreground">
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleString()
                    : "-"}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground font-medium">Last updated</dt>
                <dd className="text-muted-foreground">
                  {profile.updatedAt
                    ? new Date(profile.updatedAt).toLocaleString()
                    : "-"}
                </dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit profile</CardTitle>
          <CardDescription>Update your display name and location.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="profile-display-name">Display name</Label>
              <Input
                id="profile-display-name"
                disabled={saving}
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-location">Location</Label>
              <Input
                id="profile-location"
                disabled={saving}
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, region, or country"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={saving || !displayName.trim() || !location.trim()}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
