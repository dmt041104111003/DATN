'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/Login.module.css';

export default function AdminLoginForm() {
  const router = useRouter();
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
        setError(data.error || 'Đăng nhập thất bại');
        return;
      }

      router.push('/admin/categories');
    } catch {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginOverlay}>
      <div className={styles.loginBox}>
        <h1 className={styles.loginBoxHeading}>Đăng nhập</h1>
        <p className={styles.loginBoxSubtitle}>Quản trị</p>
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
              placeholder="Tài khoản"
              required
              aria-label="Tài khoản"
            />
            {username && (
              <button
                type="button"
                className={styles.loginInputClear}
                onClick={() => setUsername('')}
                aria-label="Xóa"
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
              placeholder="Mật khẩu"
              required
              aria-label="Mật khẩu"
            />
          </div>
          {error && <p className={styles.loginBoxError}>{error}</p>}
          <button
            type="submit"
            className={styles.loginBoxButton}
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
