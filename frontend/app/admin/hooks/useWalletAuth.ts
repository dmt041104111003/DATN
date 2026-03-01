import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '../types/index';

function stringToHex(str: string): string {
  return Array.from(str)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

const AUTH_COOKIE = 'auth_token';

type UseWalletAuthState = {
  error: string;
  loading: boolean;
  walletName: string | null;
};

type UseWalletAuthReturn = UseWalletAuthState & {
  setWalletName: (value: string | null) => void;
  setError: (value: string) => void;
  loginWithEternl: () => Promise<void>;
};

export function useWalletAuth(): UseWalletAuthReturn {
  const router = useRouter();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stakeAddress, setStakeAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);

  const loginWithEternl = async () => {
    setError('');
    setLoading(true);

    try {
      if (typeof window === 'undefined') {
        throw new Error('Browser is not ready.');
      }

      const anyWindow = window as unknown as {
        cardano?: {
          eternl?: {
            enable: () => Promise<any>;
            name?: string;
            apiVersion?: string;
          };
        };
      };

      if (!anyWindow.cardano || !anyWindow.cardano.eternl) {
        throw new Error(
          'Eternl wallet not found. Please install and enable the extension.',
        );
      }

      const api = await anyWindow.cardano.eternl.enable();

      if (anyWindow.cardano.eternl.name) {
        setWalletName(anyWindow.cardano.eternl.name ?? 'Eternl');
      }

      const [changeAddressRaw, rewardAddresses]: [unknown, string[]] =
        await Promise.all([
          api.getChangeAddress(),
          api.getRewardAddresses(),
        ]);

      const changeAddress =
        typeof changeAddressRaw === 'string'
          ? changeAddressRaw
          : (changeAddressRaw && typeof (changeAddressRaw as { address?: string }).address === 'string')
            ? (changeAddressRaw as { address: string }).address
            : '';

      if (!changeAddress) {
        throw new Error('Unable to get payment address from wallet.');
      }

      const walletAddress = changeAddress;
      setStakeAddress(walletAddress);

      const nonceRes = await fetch(`${BACKEND_URL}/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stakeAddress: walletAddress }),
      });

      const nonceData = await nonceRes.json();

      if (!nonceRes.ok || !nonceData?.nonce) {
        throw new Error(
          nonceData?.message || nonceData?.error || 'Failed to get nonce from backend.',
        );
      }

      const nonce: string = nonceData.nonce;
      const payloadHex = stringToHex(nonce);

      const signer =
        (api as any).signData ??
        (api.experimental && (api.experimental as any).signData);

      if (typeof signer !== 'function') {
        throw new Error('Wallet does not support CIP-8 signData.');
      }

      const signAddress = rewardAddresses?.[0] ?? walletAddress;
      const signed = await signer(signAddress, payloadHex);

      const verifyRes = await fetch(`${BACKEND_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stakeAddress: walletAddress,
          nonce,
          signature: signed.signature,
          key: signed.key,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(
          verifyData?.message ||
            verifyData?.error ||
            'Wallet authentication failed.',
        );
      }

      if (verifyData?.needProfile) {
        if (typeof window !== 'undefined') {
          const setup = {
            stakeAddress: walletAddress,
            roles: (Array.isArray(verifyData.roles) ? verifyData.roles : []) as Role[],
          };
          window.sessionStorage.setItem(
            'admin_profile_setup',
            JSON.stringify(setup),
          );
        }
        router.replace('/admin/profile');
        return;
      }

      if (verifyData?.token) {
        document.cookie = `${AUTH_COOKIE}=${verifyData.token}; path=/; max-age=604800`;
      }

      router.replace('/admin');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'An error occurred while logging in with the wallet.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    walletName,
    setWalletName,
    setError,
    loginWithEternl,
  };
}

