'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/ProfileSetup.module.css';
import { RoleSelect } from '../components/RoleSelect';
import { ProfileForm } from '../components/account/ProfileForm';
import type { Role, ProfileSetupState } from '../types/index';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

const AUTH_COOKIE = 'auth_token';

export default function ProfilePage() {
  const router = useRouter();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stakeAddress, setStakeAddress] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState('');

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
      window.sessionStorage.removeItem('admin_profile_setup');
      window.location.assign('/');
      return;
    }
    router.replace('/');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = window.sessionStorage.getItem('admin_profile_setup');
    if (!raw) {
      router.replace('/');
      return;
    }

    try {
      const parsed = JSON.parse(raw) as ProfileSetupState;
      if (!parsed.stakeAddress || !Array.isArray(parsed.roles)) {
        router.replace('/');
        return;
      }
      setStakeAddress(parsed.stakeAddress);
      setRoles(parsed.roles);
    } catch {
      router.replace('/');
    }
  }, [router]);

  const handleSubmit = async () => {
    setError('');
    const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;
    if (!stakeAddress || !selectedRole || !displayName) {
      setError('Please select a role and fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stakeAddress,
          roleCode: selectedRole.code,
          displayName,
          location: location.trim() || undefined,
          coordinates: coordinates.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || 'Unable to create organization account.',
        );
      }

      if (data?.token) {
        document.cookie = `${AUTH_COOKIE}=${data.token}; path=/; max-age=604800`;
      }

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('admin_profile_setup');
      }

      router.replace('/admin');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'An error occurred while creating the account.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Choose your role</h1>
        <p className={styles.subtitle}>
          Select a role and complete your profile to continue.
        </p>

        <div className={styles.stack}>
          <RoleSelect
            roles={roles}
            selectedRoleId={selectedRoleId}
            onChange={setSelectedRoleId}
            disabled={loading}
          />

          {selectedRoleId && (
            <ProfileForm
              displayName={displayName}
              onChangeDisplayName={setDisplayName}
              location={location}
              onChangeLocation={setLocation}
              coordinates={coordinates}
              onChangeCoordinates={setCoordinates}
              disabled={loading}
            />
          )}

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleSubmit}
            disabled={
              loading || !selectedRoleId || !displayName.trim()
            }
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleLogout}
            disabled={loading}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

