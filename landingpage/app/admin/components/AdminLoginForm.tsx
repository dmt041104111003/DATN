'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/Login.module.css';
import tabStyles from '../styles/Tabs.module.css';
import { LANGUAGES } from '../constants/admin';
import { getLoginLocale } from '../constants/locale';
import { useAdminLanguage } from '../context/AdminLanguageContext';

export default function AdminLoginForm() {
  const router = useRouter();
  const { adminLang, setAdminLang } = useAdminLanguage();
  const t = getLoginLocale(adminLang);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.errorLogin);
        return;
      }

      router.push('/admin/categories');
    } catch {
      setError(t.errorConnection);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginOverlay}>
      <div className={styles.loginBox}>
        <div className={tabStyles.tabs} style={{ marginBottom: 16 }}>
          {LANGUAGES.map((lang) => (
            <button key={lang.id} type="button" className={adminLang === lang.id ? tabStyles.tabActive : tabStyles.tab} onClick={() => setAdminLang(lang.id)}>
              {lang.label}
            </button>
          ))}
        </div>
        <h1 className={styles.loginBoxHeading}>{t.title}</h1>
        <p className={styles.loginBoxSubtitle}>{t.subtitle}</p>
        <form className={styles.loginBoxForm} onSubmit={handleSubmit}>
          <div className={styles.loginInputWrap}>
            <input
              className={`${styles.loginBoxInput} ${error ? styles.hasError : ''}`}
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder={t.username}
              required
              aria-label={t.username}
            />
            {username && (
              <button
                type="button"
                className={styles.loginInputClear}
                onClick={() => setUsername('')}
                aria-label={t.clear}
              >
                ×
              </button>
            )}
          </div>
          <div className={styles.loginInputWrap}>
            <input
              className={`${styles.loginBoxInput} ${error ? styles.hasError : ''}`}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder={t.password}
              required
              aria-label={t.password}
            />
          </div>
          {error && <p className={styles.loginBoxError}>{error}</p>}
          <button
            type="submit"
            className={styles.loginBoxButton}
            disabled={loading}
          >
            {loading ? t.loggingIn : t.login}
          </button>
        </form>
      </div>
    </div>
  );
}
