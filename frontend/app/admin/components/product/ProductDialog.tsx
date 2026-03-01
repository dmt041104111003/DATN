import type { ChangeEvent, FormEvent, RefObject } from 'react';
import { ReceiversMap } from './ReceiversMap';

export type ProfileOption = {
  walletAddress: string;
  displayName: string;
  location: string | null;
  coordinates: string | null;
  role?: string | null;
};

type Props = {
  styles: Record<string, string>;
  open: boolean;
  editingId: number | null;
  error: string;
  loading: boolean;
  uploading: boolean;
  slug: string;
  nameEn: string;
  descriptionEn: string;
  expiryDate: string;
  certificateHash: string;
  receiverList: string[];
  receiverDisplayNames: string[];
  receiverLocations: string;
  receiverCoordinates: string;
  profiles: ProfileOption[];
  minterLocation: string;
  minterCoordinates: string;
  imageUrl: string;
  imageInputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onExpiryChange: (v: string) => void;
  onCertificateHashChange: (v: string) => void;
  onAddReceiverFromProfile: (profile: ProfileOption) => void;
  onReceiverLocationsChange: (v: string) => void;
  onReceiverCoordinatesChange: (v: string) => void;
  onReceiverListChange: (addrs: string[]) => void;
  onReceiverDisplayNamesChange: (names: string[]) => void;
  onImageUrlChange: (v: string) => void;
  onUploadClick: () => void;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function ProductDialog(props: Props) {
  const {
    styles,
    open,
    editingId,
    error,
    loading,
    uploading,
    slug,
    nameEn,
    descriptionEn,
    expiryDate,
    certificateHash,
    receiverList,
    receiverDisplayNames,
    receiverLocations,
    receiverCoordinates,
    profiles,
    minterLocation,
    minterCoordinates,
    imageUrl,
    imageInputRef,
    onClose,
    onSubmit,
    onNameChange,
    onDescriptionChange,
    onExpiryChange,
    onCertificateHashChange,
    onAddReceiverFromProfile,
    onReceiverLocationsChange,
    onReceiverCoordinatesChange,
    onReceiverListChange,
    onReceiverDisplayNamesChange,
    onImageUrlChange,
    onUploadClick,
    onImageUpload,
  } = props;

  if (!open) return null;

  return (
    <div
      className={styles.dialogBackdrop}
      onClick={loading ? undefined : onClose}
    >
      <div
        className={styles.dialogPanel}
        onClick={(e) => e.stopPropagation()}
        style={loading ? { pointerEvents: 'none' } : undefined}
      >
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>
            {editingId ? 'Edit product' : 'Add product'}
          </h2>
          <button
            type="button"
            className={styles.dialogClose}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className={styles.dialogBody}>
          <form onSubmit={onSubmit}>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.formGroup}>
              <label className={styles.label}>Slug</label>
              <input
                className={styles.input}
                value={slug}
                readOnly
                placeholder="Auto-generated asset name"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Name</label>
              <input
                className={styles.input}
                value={nameEn}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                rows={4}
                value={descriptionEn}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Enter product description"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Expiry</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => onExpiryChange(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Certificate hash</label>
              <input
                className={styles.input}
                value={certificateHash}
                onChange={(e) => onCertificateHashChange(e.target.value)}
                placeholder="ipfs://<hash_ket_qua_kiem_nghiem>"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Receivers</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                <select
                  className={styles.input}
                  style={{ flex: '1 1 200px' }}
                  value=""
                  onChange={(e) => {
                    const id = e.target.value;
                    if (!id) return;
                    const p = profiles.find((x) => x.walletAddress === id);
                    if (p && p.coordinates) {
                      onAddReceiverFromProfile(p);
                    }
                    requestAnimationFrame(() => {
                      (e.target as HTMLSelectElement).value = '';
                    });
                  }}
                >
                  <option value="">Select profile to add as receiver</option>
                  {profiles
                    .filter(
                      (p) =>
                      p.coordinates &&
                      (p.role?.toUpperCase() === 'TRANSIT' || p.role?.toUpperCase() === 'AGENT') &&
                      !receiverList.includes(p.walletAddress)
                    )
                    .map((p) => (
                      <option key={p.walletAddress} value={p.walletAddress}>
                        {p.displayName} {p.location ? `(${p.location})` : ''}
                      </option>
                    ))}
                </select>
              </div>
              <ReceiversMap
                coordinates={receiverCoordinates}
                locations={receiverLocations}
                receiverList={receiverList}
                receiverDisplayNames={receiverDisplayNames}
                minterCoordinates={minterCoordinates}
                minterLocation={minterLocation || undefined}
                onChange={(coords, locs, addresses, displayNames) => {
                  onReceiverCoordinatesChange(coords);
                  onReceiverLocationsChange(locs);
                  if (addresses !== undefined) {
                    onReceiverListChange(
                      addresses.split(';').map((s) => s.trim()).filter(Boolean)
                    );
                  }
                  if (displayNames !== undefined) {
                    onReceiverDisplayNamesChange(
                      displayNames.split('\u241F').map((s) => s.trim())
                    );
                  }
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Image</label>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <input
                  className={styles.input}
                  value={imageUrl}
                  onChange={(e) => onImageUrlChange(e.target.value)}
                  placeholder="Image URL or click Upload"
                  style={{ flex: '1 1 200px' }}
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={onImageUpload}
                />
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={onUploadClick}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload image'}
                </button>
              </div>
            </div>
            <div className={styles.headerActions} style={{ marginTop: '1rem' }}>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

