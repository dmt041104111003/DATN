'use client';

import type { WarehouseItem } from '../../lib/warehouse';
import formStyles from '../../styles/Form.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import dialogStyles from '../../styles/Dialog.module.css';
import { formatDate } from '../../utils/date';

const styles = { ...formStyles, ...buttonStyles, ...dialogStyles };

type Props = {
  open: boolean;
  item: WarehouseItem | null;
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
      <span style={{ fontSize: 14, color: '#374151', wordBreak: 'break-all', flex: 1 }}>
        {v ?? '—'}
      </span>
    </div>
  );
}

function statusLabel(status: string | undefined): string {
  if (status === 'CONSUMED') return 'Consumed';
  if (status === 'ON_WAY') return 'On way';
  return 'In warehouse';
}

export function WarehouseDetailDialog({ open, item, onClose }: Props) {
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
        aria-labelledby="warehouse-detail-title"
      >
        <div className={styles.dialogHeader}>
          <h2 id="warehouse-detail-title" className={styles.dialogTitle}>
            Warehouse item detail
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
          {item && (
            <>
              <DetailRow label="Batch ID" value={item.batchId} />
              <DetailRow label="Batch name" value={item.batchName} />
              <DetailRow label="Status" value={statusLabel(item.status)} />
              <DetailRow
                label="Received"
                value={item.receivedAt ? formatDate(item.receivedAt) : null}
              />
              <DetailRow
                label="Out"
                value={item.outAt ? formatDate(item.outAt) : null}
              />
              <DetailRow label="Policy ID" value={item.policyId ?? undefined} />
              <div
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <span className={styles.label} style={{ marginBottom: 8, display: 'block' }}>
                  Image
                </span>
                {item.image ? (
                  <a
                    href={item.image}
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
