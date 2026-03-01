import styles from '../styles/RoleSelect.module.css';
import type { RoleSelectProps } from '../types/index';

export function RoleSelect({
  roles,
  selectedRoleId,
  onChange,
  disabled,
}: RoleSelectProps) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>Select role</span>
      <div className={styles.grid}>
        {roles.map((role) => {
          const isActive = role.id === selectedRoleId;
          return (
            <button
              key={role.id}
              type="button"
              className={
                isActive
                  ? `${styles.card} ${styles.cardActive}`
                  : styles.card
              }
              onClick={() => onChange(role.id)}
              disabled={disabled}
              aria-pressed={isActive}
            >
              <span className={styles.code}>{role.code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

