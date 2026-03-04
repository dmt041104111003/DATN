'use client';

import type { OrderDeliveryItem } from '../../lib/order';
import formStyles from '../../styles/Form.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import dialogStyles from '../../styles/Dialog.module.css';
import { formatDate } from '../../utils/date';

const styles = { ...formStyles, ...buttonStyles, ...dialogStyles };

type Props = {
  open: boolean;
  delivery: OrderDeliveryItem | null;
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

export function OrderDetailDialog({ open, delivery, onClose }: Props) {
  if (!open) return null;

  const owners = Array.isArray(delivery?.ownerAddresses) ? delivery.ownerAddresses : [];

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
        aria-labelledby="order-detail-title"
      >
        <div className={styles.dialogHeader}>
          <h2 id="order-detail-title" className={styles.dialogTitle}>
            Order detail
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
          {delivery && (
            <>
              <DetailRow label="ID" value={String(delivery.id)} />
              <DetailRow label="Batch" value={delivery.batchId} />
              <DetailRow label="Recipient" value={delivery.recipientAddress} />
              <DetailRow label="Sender" value={delivery.senderAddress} />
              <DetailRow
                label="Lock Tx"
                value={`${delivery.lockTxHash}#${delivery.scriptOutputIndex}`}
              />
              <DetailRow label="Status" value={delivery.status} />
              <DetailRow
                label="Out"
                value={delivery.outAt ? formatDate(delivery.outAt) : null}
              />
              {delivery.unlockTxHash && (
                <DetailRow label="Unlock Tx" value={delivery.unlockTxHash} />
              )}
              {owners.length > 0 && (
                <div
                  style={{
                    padding: '8px 0',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <span className={styles.label} style={{ marginBottom: 4, display: 'block' }}>
                    Owners
                  </span>
                  <div style={{ fontSize: 13, color: '#374151', wordBreak: 'break-all' }}>
                    {owners.map((addr, i) => (
                      <div key={i} style={{ marginBottom: 4 }}>
                        {addr}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
