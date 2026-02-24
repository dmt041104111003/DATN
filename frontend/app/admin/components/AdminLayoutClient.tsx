'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../styles/Layout.module.css';
import { ADMIN_NAV_ITEMS } from '../constants/admin';

const AUTH_COOKIE = 'auth_token';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const cookie = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${AUTH_COOKIE}=`));

    const token = cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : '';
    if (!token) return;

    const parts = token.split('.');
    if (parts.length < 2) return;

    const payloadPart = parts[1];
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    );

    try {
      const json = atob(padded);
      const payload = JSON.parse(json) as { role?: unknown };
      if (typeof payload.role === 'string') {
        setRole(payload.role);
      }
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const current = ADMIN_NAV_ITEMS.find((item) => item.href === pathname);
    const pageName = current?.label ?? 'Admin';
    const rolePart = role ?? 'Admin';
    document.title = `trace.lab3 - ${rolePart} - ${pageName}`;
  }, [role, pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = () => {
    if (typeof document !== 'undefined') {
      document.cookie =
        `${AUTH_COOKIE}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
    if (typeof window !== 'undefined') {
      window.location.assign('/');
      return;
    }
    router.replace('/');
  };

  const closeDrawer = () => setMenuOpen(false);

  return (
    <div className={styles.layoutContainer}>
      <div className={styles.mobileHeader}>
        <h2 className={styles.sidebarTitle}>{role}</h2>
        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
        </button>
      </div>
      {menuOpen && (
        <div
          className={styles.sidebarBackdrop}
          onClick={closeDrawer}
          aria-hidden
        />
      )}
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>{role}</h2>
          <button
            type="button"
            className={styles.menuClose}
            onClick={closeDrawer}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <div className={styles.navBody}>
          <ul className={styles.navList}>
            {ADMIN_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ''}`}
                  onClick={closeDrawer}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
