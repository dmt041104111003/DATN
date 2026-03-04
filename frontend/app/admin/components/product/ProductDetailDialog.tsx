'use client';

import type { Product } from '../../types';
import formStyles from '../../styles/Form.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import dialogStyles from '../../styles/Dialog.module.css';

const styles = { ...formStyles, ...buttonStyles, ...dialogStyles };

type Props = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  const v = value !== undefined && value !== null && value !== '' ? String(value) : null;
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
        padding: '8px 0',
        borderBottom: '1px solid #f3f4f6',
      }}
    >
      <span className={styles.label} style={{ marginBottom: 0, flex: '0 0 140px' }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: '#374151', wordBreak: 'break-word', flex: 1 }}>
        {v ?? '—'}
      </span>
    </div>
  );
}

export function ProductDetailDialog({ open, product, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className={styles.dialogBackdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.dialogPanel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        <div className={styles.dialogHeader}>
          <h2 id="product-detail-title" className={styles.dialogTitle}>
            Product detail
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
          {product && (
            <>
              <DetailRow label="ID" value={product.id} />
              <DetailRow label="Batch ID" value={product.code} />
              <DetailRow label="Name" value={product.nameEn} />
              <DetailRow label="Description" value={product.descriptionEn} />
              <DetailRow label="SKU" value={product.sku ?? undefined} />
              <DetailRow label="Origin site" value={product.originSiteCode ?? undefined} />
              <DetailRow label="Gross weight (kg)" value={product.grossWeightKg ?? undefined} />
              <DetailRow label="Net weight (kg)" value={product.netWeightKg ?? undefined} />
              <div
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <span className={styles.label} style={{ marginBottom: 8, display: 'block' }}>
                  Image
                </span>
                {product.imageUrl ? (
                  <a
                    href={product.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnText}
                    style={{ display: 'inline-block' }}
                  >
                    View image
                  </a>
                ) : (
                  <span style={{ fontSize: 14, color: '#6b7280' }}>—</span>
                )}
              </div>
              <div style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
