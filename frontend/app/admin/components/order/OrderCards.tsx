import type { OrderDeliveryItem } from '../../lib/order';
import { formatDate } from '../../utils/date';

type Props = {
  styles: Record<string, string>;
  items: OrderDeliveryItem[];
  onDetail?: (d: OrderDeliveryItem) => void;
  onComplete: (d: OrderDeliveryItem) => void;
};

export function OrderCards({ styles, items, onDetail, onComplete }: Props) {
  return (
    <div className={styles.tableCards}>
      {items.map((d) => (
        <div key={d.id} className={styles.tableCard}>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Batch</span>
            <span className={styles.tableCardValue} title={d.batchId}>
              {d.batchId.slice(0, 16)}…
            </span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Recipient</span>
            <span className={styles.tableCardValue} title={d.recipientAddress}>
              {d.recipientAddress.slice(0, 20)}…
            </span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Tx</span>
            <span className={styles.tableCardValue} title={`${d.lockTxHash}#${d.scriptOutputIndex}`}>
              <code style={{ fontSize: '0.75rem' }}>
                {d.lockTxHash.length > 14 ? `${d.lockTxHash.slice(0, 12)}…` : d.lockTxHash}…#{d.scriptOutputIndex}
              </code>
            </span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Status</span>
            <span className={styles.tableCardValue}>
              {d.status === 'DELIVERED' ? (
                <span style={{ color: '#059669', fontWeight: 600 }}>DELIVERED</span>
              ) : (
                <span>IN_TRANSIT</span>
              )}
            </span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Out</span>
            <span className={styles.tableCardValue}>{d.outAt ? formatDate(d.outAt) : '–'}</span>
          </div>
          <div className={styles.tableCardActions}>
            <div className={styles.actions}>
              {onDetail && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => onDetail(d)}
                  title="View details"
                >
                  Detail
                </button>
              )}
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => onComplete(d)}
                disabled={d.status === 'DELIVERED' || !!d.unlockTxHash}
                title="Complete delivery"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
