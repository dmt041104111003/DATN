import type { ChangeEvent, FormEvent, RefObject } from 'react';
import type { ProfileOption } from '../../types';
import { ReceiversMap } from './ReceiversMap';

type Props = {
  styles: Record<string, string>;
  open: boolean;
  editingId: number | null;
  error: string;
  loading: boolean;
  uploading: boolean;
  code: string;
  nameEn: string;
  descriptionEn: string;
  sku: string;
  grossWeightKg: string;
  netWeightKg: string;
  expiryDate: string;
  receiverList: string[];
  receiverDisplayNames: string[];
  receiverLocations: string;
  receiverCoordinates: string;
  profiles: ProfileOption[];
  minterLocation: string;
  minterCoordinates: string;
  imageUrl: string;
  imageInputRef: RefObject<HTMLInputElement | null>;
  certificateOptions: { id: number; title: string }[];
  selectedCertificateIds: number[];
  onCertificateIdsChange: (ids: number[]) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSkuChange: (v: string) => void;
  onGrossWeightChange: (v: string) => void;
  onNetWeightChange: (v: string) => void;
  onExpiryChange: (v: string) => void;
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
    code,
    nameEn,
    descriptionEn,
    sku,
    grossWeightKg,
    netWeightKg,
    expiryDate,
    receiverList,
    receiverDisplayNames,
    receiverLocations,
    receiverCoordinates,
    profiles,
    minterLocation,
    minterCoordinates,
    imageUrl,
    imageInputRef,
    certificateOptions,
    selectedCertificateIds,
    onCertificateIdsChange,
    onClose,
    onSubmit,
    onNameChange,
    onDescriptionChange,
    onSkuChange,
    onGrossWeightChange,
    onNetWeightChange,
    onExpiryChange,
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
              <label className={styles.label}>Code</label>
              <input
                className={styles.input}
                value={code}
                readOnly
                placeholder="Code lô sản phẩm (auto-generated)"
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
              <label className={styles.label}>SKU (optional)</label>
              <input
                className={styles.input}
                value={sku}
                onChange={(e) => onSkuChange(e.target.value)}
                placeholder="Internal SKU"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Weight (optional)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input
                  className={styles.input}
                  type="number"
                  step="any"
                  min="0"
                  value={grossWeightKg}
                  onChange={(e) => onGrossWeightChange(e.target.value)}
                  placeholder="Gross weight (kg)"
                />
                <input
                  className={styles.input}
                  type="number"
                  step="any"
                  min="0"
                  value={netWeightKg}
                  onChange={(e) => onNetWeightChange(e.target.value)}
                  placeholder="Net weight (kg)"
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                rows={3}
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
              <label className={styles.label}>Import certificates</label>
              <p className={styles.formHint} style={{ marginBottom: 6 }}>
                Attach certificates to this product. Create certificates in Certificates first, then select them here.
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                <select
                  className={styles.input}
                  style={{ flex: '1 1 200px' }}
                  value=""
                  onChange={(e) => {
                    const id = parseInt(e.target.value, 10);
                    if (Number.isNaN(id)) return;
                    if (!selectedCertificateIds.includes(id)) {
                      onCertificateIdsChange([...selectedCertificateIds, id]);
                    }
                    requestAnimationFrame(() => {
                      (e.target as HTMLSelectElement).value = '';
                    });
                  }}
                >
                  <option value="">Select certificate to attach</option>
                  {certificateOptions
                    .filter((c) => !selectedCertificateIds.includes(c.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (#{c.id})
                      </option>
                    ))}
                </select>
              </div>
              {selectedCertificateIds.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {selectedCertificateIds.map((id) => {
                    const cert = certificateOptions.find((c) => c.id === id);
                    return (
                      <div
                        key={id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: 'var(--accent-bg, #eff6ff)',
                          fontSize: 14,
                        }}
                      >
                        <span>{cert ? cert.title : `Certificate`} (#{id})</span>
                        <button
                          type="button"
                          onClick={() =>
                            onCertificateIdsChange(selectedCertificateIds.filter((x) => x !== id))
                          }
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            fontWeight: 600,
                            fontSize: 16,
                            lineHeight: 1,
                            padding: '2px 6px',
                          }}
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {certificateOptions.length === 0 && (
                <p className={styles.formHint}>No certificates yet. Add them in Certificates.</p>
              )}
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
                  placeholder="Upload image or paste ipfs:// hash"
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
                  {uploading ? 'Uploading...' : 'Upload'}
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

