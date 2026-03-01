'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../styles/Layout.module.css';
import { ADMIN_NAV_ITEMS, ADMIN_COMPANY_NAME, ADMIN_LOGO_URL } from '../constants/admin';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import { getSidebarLocale } from '../constants/locale';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminLang } = useAdminLanguage();
  const t = getSidebarLocale(adminLang);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const closeDrawer = () => setMenuOpen(false);

  return (
    <div className={styles.layoutContainer}>
      <div className={styles.mobileHeader}>
        <div className={styles.sidebarBrand}>
          <Image src={ADMIN_LOGO_URL} alt="" width={36} height={36} className={styles.sidebarLogo} />
          <span className={styles.sidebarCompanyName}>{ADMIN_COMPANY_NAME}</span>
        </div>
        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setMenuOpen(true)}
          aria-label={t.openMenu}
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
          <div className={styles.sidebarBrand}>
            <Image src={ADMIN_LOGO_URL} alt="" width={40} height={40} className={styles.sidebarLogo} />
            <span className={styles.sidebarCompanyName}>{ADMIN_COMPANY_NAME}</span>
          </div>
          <button
            type="button"
            className={styles.menuClose}
            onClick={closeDrawer}
            aria-label={t.closeMenu}
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
                  {t[item.labelKey]}
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            {t.logout}
          </button>
        </div>
      </aside>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
