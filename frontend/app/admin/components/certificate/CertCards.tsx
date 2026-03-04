import type { Certificate } from '../../lib/certificate';
import { formatDate } from '../../utils/date';
import { truncate } from '../../utils/string';

type Props = {
  styles: Record<string, string>;
  items: Certificate[];
  onDetail?: (cert: Certificate) => void;
  onEdit?: (cert: Certificate) => void;
  onDelete?: (cert: Certificate) => void;
};

export function CertCards({ styles, items, onDetail, onEdit, onDelete }: Props) {
  return (
    <div className={styles.tableCards}>
      {items.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '1.5rem', width: '100%' }}>
          No data
        </p>
      ) : (
        items.map((cert) => (
          <div key={cert.id} className={styles.tableCard}>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>ID</span>
              <span className={styles.tableCardValue}>{cert.id}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>Title</span>
              <span className={styles.tableCardValue} title={cert.title}>
                {truncate(cert.title)}
              </span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>No.</span>
              <span className={styles.tableCardValue} title={cert.number ?? ''}>
                {cert.number || '—'}
              </span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>Authority</span>
              <span className={styles.tableCardValue} title={cert.authority ?? ''}>
                {truncate(cert.authority)}
              </span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>Expiry</span>
              <span className={styles.tableCardValue}>
                {cert.expiryDate ? formatDate(cert.expiryDate) : '—'}
              </span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>Issued</span>
              <span className={styles.tableCardValue}>{formatDate(cert.issuedAt)}</span>
            </div>
            <div className={styles.tableCardActions}>
              <div className={styles.actions}>
                {onDetail && (
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => onDetail(cert)}
                    title="View details"
                  >
                    Detail
                  </button>
                )}
                {onEdit && (
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => onEdit(cert)}
                    title="Edit certificate"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => onDelete(cert)}
                    title="Delete certificate"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
