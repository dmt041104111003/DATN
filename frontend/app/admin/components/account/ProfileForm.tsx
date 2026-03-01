import styles from '../../styles/ProfileForm.module.css';
import type { ProfileFormProps } from '../../types/index';
import { LocationMap } from '../LocationMap';

export function ProfileForm({
  displayName,
  onChangeDisplayName,
  location,
  onChangeLocation,
  coordinates,
  onChangeCoordinates,
  disabled,
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
      <div className={styles.field}>
        <label className={styles.label}>Location</label>
        <LocationMap
          coordinates={coordinates}
          tooltipText={location || undefined}
          onChange={(coords, label) => {
            onChangeCoordinates(coords);
            onChangeLocation(label);
          }}
        />
      </div>
    </>
  );
}
