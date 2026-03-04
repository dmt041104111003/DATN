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
  unitOfMeasure: string;
  productCategory: string;
  storageCondition: string;
  originSiteCode: string;
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
  onUnitOfMeasureChange: (v: string) => void;
  onProductCategoryChange: (v: string) => void;
  onStorageConditionChange: (v: string) => void;
  onOriginSiteCodeChange: (v: string) => void;
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
    unitOfMeasure,
    productCategory,
    storageCondition,
    originSiteCode,
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
    onUnitOfMeasureChange,
    onProductCategoryChange,
    onStorageConditionChange,
    onOriginSiteCodeChange,
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
              <label className={styles.label}>Logistics info (optional)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                <input
                  className={styles.input}
                  value={unitOfMeasure}
                  onChange={(e) => onUnitOfMeasureChange(e.target.value)}
                  placeholder="Unit (e.g. KG, CARTON)"
                />
                <input
                  className={styles.input}
                  value={productCategory}
                  onChange={(e) => onProductCategoryChange(e.target.value)}
                  placeholder="Category"
                />
                <input
                  className={styles.input}
                  value={storageCondition}
                  onChange={(e) => onStorageConditionChange(e.target.value)}
                  placeholder="Storage (ambient/chilled/...)"
                />
                <input
                  className={styles.input}
                  value={originSiteCode}
                  onChange={(e) => onOriginSiteCodeChange(e.target.value)}
                  placeholder="Origin site/warehouse code"
                />
              </div>
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
              <select
                className={styles.input}
                multiple
                value={selectedCertificateIds.map(String)}
                onChange={(e) => {
                  const selected = Array.from(
                    (e.target as HTMLSelectElement).selectedOptions,
                    (o) => parseInt(o.value, 10)
                  );
                  onCertificateIdsChange(selected.filter((n) => !Number.isNaN(n)));
                }}
                style={{ minHeight: 80 }}
              >
                {certificateOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} (#{c.id})
                  </option>
                ))}
              </select>
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

