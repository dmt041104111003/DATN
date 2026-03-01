'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/Login.module.css';
import Hero from '@/app/admin/components/Hero';
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
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          window.location.href = '/';
        }}
        className={styles.loginBackHome}
      >
        Back to home
      </a>
      <div className={styles.loginLeft}>
        <Hero />
      </div>

      <div className={styles.loginRight}>
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

