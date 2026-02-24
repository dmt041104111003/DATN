'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/Login.module.css';
import { AdminHeader } from './AdminHeader';
import { stringToHex } from '../utils/stringToHex';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

export default function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stakeAddress, setStakeAddress] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<number | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [walletVersion, setWalletVersion] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const anyWindow = window as unknown as {
      cardano?: {
        eternl?: {
          name?: string;
          apiVersion?: string;
        };
      };
    };
    const eternl = anyWindow.cardano?.eternl;
    if (eternl) {
      setWalletName(eternl.name ?? 'Eternl');
      setWalletVersion(eternl.apiVersion ?? null);
    }
  }, []);

  const handleLoginWithEternl = async () => {
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
          };
        };
      };

      if (!anyWindow.cardano || !anyWindow.cardano.eternl) {
        throw new Error(
          'Eternl wallet not found. Please install and enable the extension.',
        );
      }

      const api = await anyWindow.cardano.eternl.enable();

      const [rewardAddresses, usedAddresses, netId]: [
        string[],
        string[],
        number
      ] = await Promise.all([
        api.getRewardAddresses(),
        api.getUsedAddresses(),
        api.getNetworkId(),
      ]);

      if (!rewardAddresses || rewardAddresses.length === 0) {
        throw new Error('Unable to get stake address from wallet.');
      }

      const stake = rewardAddresses[0];
      setStakeAddress(stake);
      setWalletAddress(usedAddresses?.[0] ?? null);
      setNetworkId(netId);

      const nonceRes = await fetch(`${BACKEND_URL}/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stakeAddress: stake }),
      });

      const nonceData = await nonceRes.json();

      if (!nonceRes.ok || !nonceData?.nonce) {
        throw new Error(
          nonceData?.error || 'Failed to get nonce from backend.',
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

      const signed = await signer(stake, payloadHex);

      const verifyRes = await fetch(`${BACKEND_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stakeAddress: stake,
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

      if (verifyData?.token) {
        document.cookie = `admin_token=${verifyData.token}; path=/; max-age=604800`;
      }

      router.push('/admin/products');
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

  return (
    <div className={`${styles.loginOverlay} service`}>
      <div className={styles.loginLeft}>
        <div className="globe">
          <div className="worldmap" />
          <div className="puff" />
        </div>
      </div>

      <div className={styles.loginRight}>
        <AdminHeader />
        <div className={styles.loginBox}>
          <button
            type="button"
            className={styles.loginBoxButton}
            onClick={handleLoginWithEternl}
            disabled={loading}
          >
            {loading
              ? 'Connecting wallet...'
              : walletName
              ? `Connect ${walletName}`
              : 'Connect wallet'}
          </button>

          {error && (
            <p className={styles.loginBoxError} role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

