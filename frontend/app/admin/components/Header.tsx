import styles from '../styles/Login.module.css';

export function AdminHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerBrand}>
        <img
          src="/logo.png"
          alt="TRACE.LAB3 logo"
          className={styles.headerLogo}
        />
        <div>
          <h1 className={styles.headerTitle}>TRACE.LAB3</h1>
        </div>
      </div>
  
    </header>
  );
}

