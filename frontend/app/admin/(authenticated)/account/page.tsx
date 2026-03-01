'use client';

import { useEffect, useState } from 'react';
import type { Account } from '../../types/index';
import { readAccountFromToken } from '../../lib/account';
import { AccountProfile } from '../../components/account/AccountProfile';
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';
const AUTH_COOKIE = 'auth_token';

export default function AdminAccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fromToken = readAccountFromToken();
    if (!fromToken) return;
    setAccount(fromToken);
    setDisplayName(fromToken.displayName);
    setLocation(fromToken.location ?? '');
    setCoordinates(fromToken.coordinates ?? '');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      setIsMobile(window.innerWidth < 768);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handleChangeAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      if (file) alert('Please choose an image file (jpg, png, webp...)');
      return;
    }

    const cookie = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${AUTH_COOKIE}=`));

    const token = cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : '';
    if (!token) {
      setError('Session expired. Please log in again.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const imageDataUrl =
          typeof reader.result === 'string' ? reader.result : '';
        if (!imageDataUrl) {
          throw new Error('Failed to read image file.');
        }

        const res = await fetch(`${BACKEND_URL}/profile/avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, imageDataUrl }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.message || data?.error || 'Unable to upload avatar.',
          );
        }

        if (data?.token) {
          document.cookie = `${AUTH_COOKIE}=${data.token}; path=/; max-age=604800`;
        }

        if (data?.profile?.avatarUrl) {
          setAccount((prev) =>
            prev
              ? {
                  ...prev,
                  avatarUrl: data.profile.avatarUrl,
                }
              : prev,
          );
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'An error occurred while uploading the avatar.';
        setError(message);
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      alert('Failed to read image file');
      setUploading(false);
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }

    const cookie = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${AUTH_COOKIE}=`));

    const token = cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : '';

    if (!token) {
      setError('Session expired. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          displayName: displayName.trim(),
          location: location.trim() || undefined,
          coordinates: coordinates.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || 'Unable to update profile.',
        );
      }

      if (data?.token) {
        document.cookie = `${AUTH_COOKIE}=${data.token}; path=/; max-age=604800`;
      }

      if (data?.profile) {
        setAccount((prev) =>
          prev
            ? {
                ...prev,
                displayName: data.profile.displayName,
                location: data.profile.location ?? null,
                coordinates: data.profile.coordinates ?? null,
              }
            : prev,
        );
      }

      setSaved(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'An error occurred while updating the profile.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountProfile
      account={account}
      isMobile={isMobile}
      uploading={uploading}
      loading={loading}
      error={error}
      saved={saved}
      displayName={displayName}
      onChangeDisplayName={setDisplayName}
      location={location}
      onChangeLocation={setLocation}
      coordinates={coordinates}
      onChangeCoordinates={setCoordinates}
      onSubmit={handleSubmit}
      onChangeAvatar={handleChangeAvatar}
    />
  );
}

