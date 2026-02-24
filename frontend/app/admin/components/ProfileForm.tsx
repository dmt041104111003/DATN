import styles from '../styles/ProfileForm.module.css';
import type { ProfileFormProps } from '../types/index';

export function ProfileForm({
  displayName,
  glnCodeRoot,
  onChangeDisplayName,
  onChangeGlnCodeRoot,
  disabled,
  showGln,
}: ProfileFormProps) {
  return (
    <>
      <div className={styles.field}>
        <label htmlFor="displayName" className={styles.label}>
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => onChangeDisplayName(e.target.value)}
          disabled={disabled}
          className={styles.input}
          placeholder="e.g. TraceLab3 Co., Ltd."
        />
      </div>

      {showGln && (
        <div className={styles.field}>
          <label htmlFor="glnCodeRoot" className={styles.label}>
            Root GLN
          </label>
          <input
            id="glnCodeRoot"
            type="text"
            value={glnCodeRoot}
            onChange={(e) => onChangeGlnCodeRoot(e.target.value)}
            disabled={disabled}
            className={styles.input}
            placeholder="e.g. 8938500000000"
          />
        </div>
      )}
    </>
  );
}

