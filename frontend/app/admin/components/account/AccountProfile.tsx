'use client';

import { useRef } from 'react';
import type { AccountProfileProps } from '../../types';
import { ProfileForm } from './ProfileForm';
import layoutStyles from '../../styles/AccountProfile.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import formStyles from '../../styles/Form.module.css';

const styles = { ...layoutStyles, ...buttonStyles, ...formStyles };

export function AccountProfile({
  account,
  isMobile,
  uploading,
  loading,
  error,
  saved,
  displayName,
  onChangeDisplayName,
  location,
  onChangeLocation,
  coordinates,
  onChangeCoordinates,
  onSubmit,
  onChangeAvatar,
}: AccountProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.formCard}>
      <div
        className={styles.accountLayout}
        data-mobile={isMobile ? 'true' : 'false'}
      >
        <div className={styles.accountAvatarCol}>
          <div className={styles.accountAvatarCircle}>
            <img
              src={account?.avatarUrl || '/avatar.png'}
              alt="Avatar"
              className={styles.accountAvatarImage}
            />
          </div>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !account}
          >
            {uploading ? 'Uploading avatar...' : 'Change avatar'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.accountHiddenInput}
            onChange={onChangeAvatar}
          />
        </div>

        <div className={styles.accountInfoCol}>
          <div
            className={`${styles.accountHeader} ${
              isMobile ? styles.accountHeaderMobile : ''
            }`}
          >
            <h1 className={styles.accountName}>
              {account?.displayName || 'Unnamed account'}
            </h1>
            <div className={styles.accountStake}>{account?.stakeAddress ?? ''}</div>
            <div className={styles.accountRole}>
              <span>{account?.roleCode ?? ''}</span>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            {error && <p className={styles.error}>{error}</p>}

            <ProfileForm
              displayName={displayName}
              onChangeDisplayName={onChangeDisplayName}
              location={location}
              onChangeLocation={onChangeLocation}
              coordinates={coordinates}
              onChangeCoordinates={onChangeCoordinates}
              disabled={loading || !account}
            />

            <div className={styles.accountActions}>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={loading || !account}
              >
                {loading ? 'Saving...' : 'Save changes'}
              </button>
            </div>

            {saved && (
              <p className={styles.accountStatusSuccess}>Account updated.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
