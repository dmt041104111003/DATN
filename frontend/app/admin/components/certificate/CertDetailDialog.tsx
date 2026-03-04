'use client';

import type { Certificate } from '../../lib/certificate';
import formStyles from '../../styles/Form.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import dialogStyles from '../../styles/Dialog.module.css';
import { formatDate } from '../../utils/date';

const styles = { ...formStyles, ...buttonStyles, ...dialogStyles };

type Props = {
  open: boolean;
  cert: Certificate | null;
  onClose: () => void;
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  const v = value?.trim() || null;
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

export function CertDetailDialog({ open, cert, onClose }: Props) {
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
        aria-labelledby="cert-detail-title"
      >
        <div className={styles.dialogHeader}>
          <h2 id="cert-detail-title" className={styles.dialogTitle}>
            Certificate detail
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
          {cert && (
            <>
              <DetailRow label="ID" value={String(cert.id)} />
              <DetailRow label="Title" value={cert.title} />
              <DetailRow label="No." value={cert.number} />
              <DetailRow label="Authority" value={cert.authority} />
              <DetailRow label="Document type" value={cert.documentType} />
              <DetailRow label="Standard" value={cert.standardReference} />
              <DetailRow label="Scope" value={cert.scope} />
              <DetailRow
                label="Expiry"
                value={cert.expiryDate ? formatDate(cert.expiryDate) : null}
              />
              <DetailRow label="Issued" value={formatDate(cert.issuedAt)} />
              {cert.documentUrl && (
                <DetailRow
                  label="Document URL"
                  value={cert.documentUrl}
                />
              )}
              <div
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <span className={styles.label} style={{ marginBottom: 8, display: 'block' }}>
                  Image
                </span>
                {cert.imageUrl ? (
                  <a
                    href={cert.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnSecondary}
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
