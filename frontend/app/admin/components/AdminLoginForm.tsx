'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/Login.module.css';
import { AdminHeader } from './AdminHeader';
import { useWalletAuth } from '../hooks/useWalletAuth';

const AUTH_COOKIE = 'auth_token';

export default function AdminLoginForm() {
  const router = useRouter();
  const {
    error,
    loading,
    walletName,
    setWalletName,
    loginWithEternl,
  } = useWalletAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.cookie.includes(`${AUTH_COOKIE}=`)) {
      router.replace('/admin');
      return;
    }
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
    }
  }, []);

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
            onClick={loginWithEternl}
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

